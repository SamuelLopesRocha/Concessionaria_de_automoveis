package main

import (
    "github.com/gin-gonic/gin"
    "Concessionaria/config"
    "Concessionaria/route"
)

func main() {
    config.ConnectDatabase()

    r := gin.Default()
    route.CarroRoutes(r)



    r.Run(":6000") // Roda o servidor na porta 6000
}