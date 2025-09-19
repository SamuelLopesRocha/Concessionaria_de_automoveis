package compra

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Buscar todos os registros de compra
func GetCompras(c *gin.Context) {
	compras, err := GetAllCompras()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar os registros de compra"})
		return
	}
	c.JSON(http.StatusOK, compras)
}

// Criar novo registros de compra
func CreateCompra_C(c *gin.Context) {
	var novaCompra Compra
	if err := c.ShouldBindJSON(&novaCompra); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	// Criar registros de compra no banco
	if err := CreateCompra(&novaCompra); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar o registro de compra"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registro criado"})
}

// Buscar registros de compra por ID
func GetCompraByID_C(c *gin.Context) {
	id := c.Param("id")

	compraEncontrada, err := GetCompraById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Registro não encontrado"})
		return
	}

	c.JSON(http.StatusOK, compraEncontrada)
}

// Atualizar registros de compra
func UpdateCompra_C(c *gin.Context) {
	id := c.Param("id")

	compraEncontrada, err := GetCompraById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Registro não encontrado"})
		return
	}

	if err := c.ShouldBindJSON(&compraEncontrada); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if err := UpdateCompra(compraEncontrada); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar o registro"})
		return
	}

	c.JSON(http.StatusOK, compraEncontrada)
}

// Deletar registros de compra
func DeleteCompra_C(c *gin.Context) {
	id := c.Param("id")

	if err := DeleteCompra(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar o registro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "registro deletado com sucesso"})
}
