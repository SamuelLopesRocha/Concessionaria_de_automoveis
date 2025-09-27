package funcionario

import "github.com/gin-gonic/gin"

func FuncRoutes(router *gin.Engine) {
	funcGroup := router.Group("/funcionarios")
	{
		funcGroup.GET("", GetFuncs)
		funcGroup.POST("", CreateFunc_C)
		funcGroup.GET("/:id", GetFuncByID_C)
		funcGroup.PUT("/:id", UpdateFunc_C)
		funcGroup.DELETE("/:id", DeleteFunc_C)
	}
} // FuncRoutes
