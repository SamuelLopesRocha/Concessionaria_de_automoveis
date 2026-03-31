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

	r.POST("/clientes/:id/reenviar-email", h.ReenviarEmail)
	r.GET("/verificar-email", h.VerificarEmail)
}
