//go run app.go

package main

import (
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/carro"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/compra"
    "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/funcionario"
    "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/venda"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"github.com/gin-gonic/gin"
)

func main() {
	// Conecta ao banco
	config.ConnectDatabase()

	// Migra os modelos
	config.DB.AutoMigrate(
		&carro.Carro{},
		&funcionario.Funcionario{},
		&compra.Compra{},
        &venda.Venda{},
	)

	// Cria o roteador Gin
	r := gin.Default()

	// Registra as rotas
	carro.CarroRoutes(r)
	funcionario.FuncRoutes(r)
	compra.CompraRoutes(r)
    venda.VendaRoutes(r)

	// Roda o servidor na porta 5001
	r.Run("0.0.0.0:5001")
}
