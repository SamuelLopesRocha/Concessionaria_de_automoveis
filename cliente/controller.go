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

	// Token seguro
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

	// ✅ Link com a porta real (ex.: localhost:5001)
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	host := c.Request.Host // ex: localhost:5001
	linkVerificacao := scheme + "://" + host + "/verificar-email?token=" + token

	// Python
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
		c.Redirect(http.StatusFound, "http://localhost:3000/email-verificado?status=erro&motivo=token_ausente")
		return
	}

	var cli Cliente
	if err := h.DB.Where("email_token = ?", token).First(&cli).Error; err != nil {
		c.Redirect(http.StatusFound, "http://localhost:3000/email-verificado?status=erro&motivo=token_invalido")
		return
	}

	now := time.Now()

	if cli.EmailTokenUsadoEm != nil {
		c.Redirect(http.StatusFound, "http://localhost:3000/email-verificado?status=erro&motivo=token_usado")
		return
	}

	if cli.EmailTokenExpiraEm == nil || now.After(*cli.EmailTokenExpiraEm) {
		c.Redirect(http.StatusFound, "http://localhost:3000/email-verificado?status=erro&motivo=token_expirado")
		return
	}

	cli.StatusEmail = Verificado
	cli.DataConfirmacaoEmail = &now
	cli.EmailTokenUsadoEm = &now

	if err := h.DB.Save(&cli).Error; err != nil {
		c.Redirect(http.StatusFound, "http://localhost:3000/email-verificado?status=erro&motivo=falha_banco")
		return
	}

	c.Redirect(http.StatusFound, "http://localhost:3000/email-verificado?status=ok")
}
