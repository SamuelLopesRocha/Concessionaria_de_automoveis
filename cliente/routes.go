package cliente

import (
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	DB *gorm.DB
}

func ClienteRoutes(r *gin.Engine) {
	h := &Handler{DB: config.DB}

	// Email verificação
	r.POST("/clientes/:id/reenviar-email", h.ReenviarEmail)
	r.GET("/verificar-email", h.VerificarEmail)

	// (Opcional) outras rotas de cliente aqui...
	// r.GET("/clientes", h.Listar)
	// r.GET("/clientes/:id", h.Buscar)
	// r.POST("/clientes", h.Criar)
	// r.PUT("/clientes/:id", h.Atualizar)
	// r.DELETE("/clientes/:id", h.Deletar)
}
