//go run app.go

package main

import (
	"fmt"
	"log"
	"runtime/debug"
	"time"

	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/carro"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/compra"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/funcionario"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/venda"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Conecta ao banco
	config.ConnectDatabase()

	// Migra os modelos
	if err := config.DB.AutoMigrate(&carro.Carro{}, &funcionario.Funcionario{}, &compra.Compra{}, &venda.Venda{}); err != nil {
		log.Fatalf("Erro ao migrar modelos: %v", err)
	}

	// Roteador
	r := gin.Default()

	// CORS: configuração para desenvolvimento
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // ajuste conforme porta do seu frontend
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Middleware de recovery custom para logar stack trace
	r.Use(func(c *gin.Context) {
		defer func() {
			if rec := recover(); rec != nil {
				log.Printf("[PANIC] %v\n%s", rec, debug.Stack())
				c.AbortWithStatusJSON(500, gin.H{"error": "erro interno"})
			}
		}()
		c.Next()
	})

	// Middleware de logging simples (método, path, status, duração)
	r.Use(func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method
		c.Next()
		dur := time.Since(start)
		status := c.Writer.Status()
		log.Printf("[REQ] %s %s -> %d (%s)", method, path, status, dur)
	})

	// Rotas
	carro.CarroRoutes(r)
	funcionario.FuncRoutes(r)
	compra.CompraRoutes(r)
	venda.VendaRoutes(r)

	// Health check simples
	r.GET("/health", func(c *gin.Context) {
		var count int64
		if config.DB != nil {
			if err := config.DB.Model(&funcionario.Funcionario{}).Count(&count).Error; err != nil {
				c.JSON(500, gin.H{"status": "erro", "detalhe": err.Error()})
				return
			}
		}
		c.JSON(200, gin.H{"status": "ok", "funcionarios": count, "time": time.Now().Format(time.RFC3339)})
	})

	log.Println("API ouvindo em http://localhost:5001")
	if err := r.Run("0.0.0.0:5001"); err != nil {
		fmt.Println("Falha ao iniciar servidor:", err)
	}
}
