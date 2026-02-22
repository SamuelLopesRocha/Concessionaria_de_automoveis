package cliente

import (
	"net/http"
	"time"

	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"github.com/gin-gonic/gin"
)

func ConfirmarEmail(c *gin.Context) {
	id := c.Param("id")

	var cli Cliente

	// Buscar cliente
	if err := config.DB.First(&cli, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"erro": "Cliente não encontrado",
		})
		return
	}

	// Verificar se já está confirmado
	if cli.StatusEmail == Verificado {
		c.JSON(http.StatusOK, gin.H{
			"mensagem": "Email já confirmado anteriormente!",
		})
		return
	}

	// Atualizar status
	now := time.Now()
	cli.StatusEmail = Verificado
	cli.DataConfirmacaoEmail = &now

	// Salvar no banco
	if err := config.DB.Save(&cli).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"erro": "Erro ao confirmar email",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"mensagem": "Email confirmado com sucesso!",
	})
}
