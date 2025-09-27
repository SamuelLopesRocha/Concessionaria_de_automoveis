package main

import (
	"log"

	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/carro"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/funcionario"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Conecta ao banco
	config.ConnectDatabase()

	// Migra os modelos
	if err := config.DB.AutoMigrate(&carro.Carro{}, &funcionario.Funcionario{}); err != nil {
		log.Fatalf("Erro ao migrar modelos: %v", err)
	}

	// Roteador
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"*"},
		AllowMethods:  []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:  []string{"Origin", "Content-Type"},
		ExposeHeaders: []string{"Content-Length"},
	}))

	// Rotas
	carro.CarroRoutes(r)
	funcionario.FuncRoutes(r)

	log.Println("API ouvindo em http://localhost:5001")
	r.Run(":5001")
}
