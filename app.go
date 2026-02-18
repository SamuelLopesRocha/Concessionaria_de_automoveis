package main

import (
	"fmt"
	"log"
	"runtime/debug"
	"time"

	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/carro"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/cliente"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/compra"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/funcionario"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/venda"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.ConnectDatabase()

	if err := config.DB.AutoMigrate(
		&carro.Carro{},
		&funcionario.Funcionario{},
		&compra.Compra{},
		&cliente.Cliente{},
		&venda.Venda{},
	); err != nil {
		log.Fatalf("Erro ao migrar modelos: %v", err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.Use(func(c *gin.Context) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("[PANIC] %v\n%s", rec, debug.Stack())
				c.AbortWithStatusJSON(500, gin.H{"error": "erro interno"})
			}
		}()
		c.Next()
	})

	carro.CarroRoutes(r)
	funcionario.FuncRoutes(r)
	compra.CompraRoutes(r)
	venda.VendaRoutes(r)

	log.Println("API ouvindo em http://localhost:5001")
	if err := r.Run("0.0.0.0:5001"); err != nil {
		fmt.Println("Falha ao iniciar servidor:", err)
	}
}
