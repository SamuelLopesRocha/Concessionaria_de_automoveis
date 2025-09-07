package main

import (
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/carro"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Conecta ao banco
	config.ConnectDatabase()

	// Migra o modelo Carro
	config.DB.AutoMigrate(&carro.Carro{})

	// Cria o roteador Gin
	r := gin.Default()

	// Configuração CORS

	r.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"*"},
		AllowMethods:  []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type"},
		ExposeHeaders: []string{"Content-Length"},
		// AllowCredentials: true, // Remova ou comente esta linha!
	}))

	// Registra as rotas do pacote carro
	carro.CarroRoutes(r)

	// Roda o servidor na porta 8080
	r.Run(":5000")
}
