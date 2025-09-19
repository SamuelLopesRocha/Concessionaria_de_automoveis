package venda

import "github.com/gin-gonic/gin"

func VendaRoutes(router *gin.Engine) {
	vendaGroup := router.Group("/vendas")
	{
		vendaGroup.GET("/", GetVendas)
		vendaGroup.POST("/", CreateVenda_C)
		vendaGroup.GET("/:id", GetVendaByID_C)
		vendaGroup.PUT("/:id", UpdateVenda_C)
		vendaGroup.DELETE("/:id", DeleteVenda_C)
	}
}
