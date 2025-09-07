package carro

import "github.com/gin-gonic/gin"

func CarroRoutes(router *gin.Engine) {
	carroGroup := router.Group("/carros")
	{
		carroGroup.GET("", GetCarros)
		carroGroup.POST("", CreateCarro_C)
		carroGroup.GET("/:placa", GetCarroByID_C)
		carroGroup.PUT("/:placa", UpdateCarro_C)
		carroGroup.DELETE("/:placa", DeleteCarro_C)
	}
}
