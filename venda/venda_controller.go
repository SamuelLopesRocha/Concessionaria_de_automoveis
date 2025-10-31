package venda

import (
	"fmt"
	"net/http"
	"github.com/gin-gonic/gin"
)

// Buscar todos os registros de venda
func GetVendas(c *gin.Context) {
	vendas, err := GetAllVendas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar o registro de venda"})
		return
	}
	c.JSON(http.StatusOK, vendas)
}


// Criar novos registros de venda
func CreateVenda_C(c *gin.Context) {
	var novaVenda Venda
	if err := c.ShouldBindJSON(&novaVenda); err != nil {
		fmt.Println("Erro de Bind JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	// Criar registros de venda no banco
	if err := CreateVenda(&novaVenda); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar o registro de venda"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "registro de venda criado"})
}

// Buscar registros de venda por ID
func GetVendaByID_C(c *gin.Context) {
	
	id := c.Param("id")

	vendaEncontrada, err := GetVendaById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "registro de venda não encontrado"})
		return
	}

	c.JSON(http.StatusOK, vendaEncontrada)
}

// Atualizar registros de venda
func UpdateVenda_C(c *gin.Context) {
	id := c.Param("id")

	vendaEncontrada, err := GetVendaById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "registro de venda não encontrada"})
		return
	}

	if err := c.ShouldBindJSON(&vendaEncontrada); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if err := UpdateVenda(vendaEncontrada); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar registro de venda"})
		return
	}

	c.JSON(http.StatusOK, vendaEncontrada)
}

// Deletar registros de venda
func DeleteVenda_C(c *gin.Context) {
	id := c.Param("id")

	if err := DeleteVenda(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar registro de venda"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "registro de venda deletado com sucesso"})
}

