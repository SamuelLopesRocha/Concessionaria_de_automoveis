package main

import (
    "github.com/gin-gonic/gin"
    "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/carro"
    "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/funcionario"
    "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
)

func main() {
    // Conecta ao banco
    config.ConnectDatabase()

    // Migra o modelo Carro
    config.DB.AutoMigrate(&carro.Carro{})

    // Migra o modelo Funcionario
    config.DB.AutoMigrate(&funcionario.Funcionario{})

    // Cria o roteador Gin
    r := gin.Default()

    // Registra as rotas do pacote carro
    carro.CarroRoutes(r)

    // Registra as rotas do pacote carro
    funcionario.FuncRoutes(r)

    // Roda o servidor na porta 6000
    r.Run("0.0.0.0:6000")
}
