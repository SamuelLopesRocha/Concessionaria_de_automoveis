package compra

import "github.com/gin-gonic/gin"

func CompraRoutes(router *gin.Engine) {
	compraGroup := router.Group("/compras")
	{
		compraGroup.GET("/", GetCompras)
		compraGroup.POST("/", CreateCompra_C)
		compraGroup.GET("/:id", GetCompraByID_C)
		compraGroup.PUT("/:id", UpdateCompra_C)
		compraGroup.DELETE("/:id", DeleteCompra_C)
	}
}
