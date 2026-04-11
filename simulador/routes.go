package simulador

import "github.com/gin-gonic/gin"

func SimuladorRoutes(r *gin.Engine) {
	r.POST("/simulador", Simular)
}
