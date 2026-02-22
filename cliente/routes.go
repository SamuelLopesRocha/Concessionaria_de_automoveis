package cliente

import "github.com/gin-gonic/gin"

func ClienteRoutes(r *gin.Engine) {

	r.GET("/clientes/confirmar/:id", ConfirmarEmail)

}
