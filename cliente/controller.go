package cliente

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// POST /clientes/:id/reenviar-email
func (h *Handler) ReenviarEmail(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil || idInt <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id inválido"})
		return
	}

	var cli Cliente
	if err := h.DB.First(&cli, uint(idInt)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "cliente não encontrado"})
		return
	}

	token, err := gerarTokenEmail()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "falha ao gerar token"})
		return
	}

	now := time.Now()
	exp := now.Add(30 * time.Minute)

	cli.EmailToken = token
	cli.EmailTokenExpiraEm = &exp
	cli.EmailTokenUsadoEm = nil
	cli.StatusEmail = Pendente
	cli.DataEnvioEmail = &now
	cli.TentativasEnvio += 1

	if err := h.DB.Save(&cli).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "falha ao salvar cliente"})
		return
	}

	// ✅ Para DEV: evita problema de localhost/IPv6
	linkVerificacao := "http://127.0.0.1:5001/verificar-email?token=" + token

	pythonEndpoint := "http://localhost:5000/send-email"

	status, body, err := enviarEmailViaPython(
		context.Background(),
		pythonEndpoint,
		emailPythonPayload{
			ClienteID:       cli.ID,
			Nome:            cli.Nome,
			Email:           cli.Email,
			LinkVerificacao: linkVerificacao,
		},
	)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error":         "falha ao enviar email via python",
			"python_status": status,
			"python_body":   body,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":        "ok",
		"python_status": status,
	})
}

// GET /verificar-email?token=...
func (h *Handler) VerificarEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.Data(http.StatusBadRequest, "text/html; charset=utf-8", []byte(paginaErro("Token ausente", "Reenvie o e-mail e use o link mais recente.")))
		return
	}

	var cli Cliente
	if err := h.DB.Where("email_token = ?", token).First(&cli).Error; err != nil {
		c.Data(http.StatusNotFound, "text/html; charset=utf-8", []byte(paginaErro("Token inválido", "Reenvie o e-mail e tente novamente.")))
		return
	}

	now := time.Now()

	if cli.EmailTokenUsadoEm != nil {
		c.Data(http.StatusBadRequest, "text/html; charset=utf-8", []byte(paginaErro("Token já utilizado", "Este link já foi usado. Se precisar, reenvie o e-mail.")))
		return
	}

	if cli.EmailTokenExpiraEm == nil || now.After(*cli.EmailTokenExpiraEm) {
		c.Data(http.StatusBadRequest, "text/html; charset=utf-8", []byte(paginaErro("Token expirado", "Reenvie o e-mail para gerar um novo link.")))
		return
	}

	cli.StatusEmail = Verificado
	cli.DataConfirmacaoEmail = &now
	cli.EmailTokenUsadoEm = &now

	if err := h.DB.Save(&cli).Error; err != nil {
		c.Data(http.StatusInternalServerError, "text/html; charset=utf-8", []byte(paginaErro("Falha ao confirmar", "Tente novamente em instantes.")))
		return
	}

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(paginaSucesso(cli.Nome)))
}

func paginaSucesso(nome string) string {
	return `<!doctype html>
<html lang="pt-br">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>E-mail verificado</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f6f7fb;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:22px;box-shadow:0 8px 24px rgba(0,0,0,.08);">
    <h2 style="margin:0 0 10px 0;color:#16a34a;">✅ E-mail verificado com sucesso!</h2>
    <p style="margin:0;color:#334155;line-height:1.6;">Obrigado, ` + nome + `. Seu e-mail foi confirmado.</p>
  </div>
</body>
</html>`
}

func paginaErro(titulo, detalhe string) string {
	return `<!doctype html>
<html lang="pt-br">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Falha na verificação</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f6f7fb;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:22px;box-shadow:0 8px 24px rgba(0,0,0,.08);">
    <h2 style="margin:0 0 10px 0;color:#dc2626;">❌ ` + titulo + `</h2>
    <p style="margin:0;color:#334155;line-height:1.6;">` + detalhe + `</p>
  </div>
</body>
</html>`
}
