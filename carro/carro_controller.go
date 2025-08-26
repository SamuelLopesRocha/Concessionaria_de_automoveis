package carro

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "Concessionaria/models"
    "Concessionaria/route"
	"Concessionaria/config"
)

// Buscar todos os carros 
func GetCarros(c *gin.Context) {
    carros, err := route.GetAllCarros()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar os carros"})
        return
    }
    c.JSON(http.StatusOK, carros)
}

// Criar novo carro
func CreateCarro(c *gin.Context) {
    var carro models.Carro

    // Tenta converter o JSON da requisição para a estrutura do Carro. Retorna erro 400 se o JSON estiver inválido.
    if err := c.ShouldBindJSON(&carro); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
        return
    }

    // Cria o carro no banco
    if err := config.DB.Create(&carro).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar o carro"})
        return
    }

    // Retorna o carro criado
    c.JSON(http.StatusCreated, gin.H{"message": "carro criado"})

}

// Buscar carro por ID
func GetCarroByID(c *gin.Context) {
    placaParam := c.Param("placa")
    placa, err := strconv.Atoi(placaParam)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "placa inválida"})
        return
    }

    carro, err := repository.GetCarroByID(uint(carro))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Carro não encontrada"})
        return
    }

    c.JSON(http.StatusOK, carro)
}

// Atualizar o carro
func UpdateCarro(c *gin.Context) {
    placaParam := c.Param("placa")
    placa, err := strconv.Atoi(placaParam)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Placa inválido"})
        return
    }

    carro, err := route.GetCarroByID(uint(placa))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Carro não encontrado"})
        return
    }

    if err := c.ShouldBindJSON(&carro); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    carro.CarroPlaca = uint(placa) // Garante que o ID não seja sobrescrito
    if err := route.UpdateCarro(carro); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar o carro"})
        return
    }

    c.JSON(http.StatusOK, carro)
}

// Deletar carro
func DeleteCarro	(c *gin.Context) {
    placaParam := c.Param("placa")
    placa, err := strconv.Atoi(placaParam)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Placa inválido"})
        return
    }

    if err := route.DeleteCarro(uint(id)); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar o carro"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Carro deletado com sucesso"})
}