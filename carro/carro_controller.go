package carro

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Buscar todos os carros
func GetCarros(c *gin.Context) {
	carros, err := GetAllCarros()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar os carros"})
		return
	}
	c.JSON(http.StatusOK, carros)
}

// Criar novo carro
func CreateCarro_C(c *gin.Context) {
	var novoCarro Carro
	if err := c.ShouldBindJSON(&novoCarro); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if err := CreateCarro(&novoCarro); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar o carro"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Carro criado"})
}

// Buscar carro por placa
func GetCarroByID_C(c *gin.Context) {
	placa := c.Param("placa")

	carroEncontrado, err := GetCarroByPlaca(placa)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Carro não encontrado"})
		return
	}

	c.JSON(http.StatusOK, carroEncontrado)
}

// Atualizar carro
func UpdateCarro_C(c *gin.Context) {
	placa := c.Param("placa")

	carroEncontrado, err := GetCarroByPlaca(placa)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Carro não encontrado"})
		return
	}

	if err := c.ShouldBindJSON(&carroEncontrado); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	carroEncontrado.Placa = placa // garante que a placa não seja alterada

	if err := UpdateCarro(carroEncontrado); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar o carro"})
		return
	}

	c.JSON(http.StatusOK, carroEncontrado)
}

// Deletar carro
func DeleteCarro_C(c *gin.Context) {
	placa := c.Param("placa")

	if err := DeleteCarro(placa); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar o carro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Carro deletado com sucesso"})
}
