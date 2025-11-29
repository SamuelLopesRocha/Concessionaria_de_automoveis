package carro

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

// Esta função verifica se a placa está no formato padrão brasileiro (ABC-1234 ou ABC1D23) com ou sem hífen.
func ValidarPlaca(placa string) bool {
	re := regexp.MustCompile(`^[A-Z]{3}-?\d[A-Z0-9]\d{2}$`)
	return re.MatchString(placa)
}

// Função para padronizar a placa antes de salvar no banco de dados Remove hífen e converte para maiúsculo.
func PadronizarPlaca(placa string) string {
	placa = strings.ToUpper(placa)
	return strings.ReplaceAll(placa, "-", "")
}

// Função para validar a cor do carro e garantir que a cor não seja vazia e contenha apenas letras e espaços.
func ValidarCor(cor string) bool {
	if len(strings.TrimSpace(cor)) == 0 {
		return false
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ\s]+$`)
	return re.MatchString(cor)
}

// Valida a marca do carro (obrigatório pode ter letras, números e espaços)
func ValidarMarca(marca string) bool {
	marca = strings.TrimSpace(marca)
	if len(marca) == 0 {
		return false // obrigatório
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ0-9\s]+$`)
	return re.MatchString(marca)
}

// Valida o modelo do carro (obrigatório, letras, números, espaços e ponto)
func ValidarModelo(modelo string) bool {
	modelo = strings.TrimSpace(modelo)
	if len(modelo) == 0 {
		return false // obrigatório
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ0-9\s.]+$`)
	return re.MatchString(modelo)
}

// Valida o ano do carro (obrigatório, maior que 1900 e menor que 2030)
func ValidarAno(ano int) bool {
	return ano > 1900 && ano <= 2030
}

// Valida Km do carro (opcional, se não enviado assume 0)
func ValidarKm(km float32) float32 {
	if km < 0 {
		return 0
	}
	return km
}

// Valida valor do carro (opcional, se não enviado assume 0)
func ValidarValor(valor float64) float64 {
	if valor < 0 {
		return 0
	}
	return valor
}

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

	// Validação de placa antes de salvar no banco Aqui garante que a placa seja obrigatória e esteja no formato correto.
	if !ValidarPlaca(novoCarro.Placa) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placa inválida. Use formato ABC-1234 ou ABC1D23"})
		return
	}

	// Padroniza a placa antes de salvar
	novoCarro.Placa = PadronizarPlaca(novoCarro.Placa)

	// Validação da cor
	if !ValidarCor(novoCarro.Cor) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cor inválida. Use apenas letras e espaços"})
		return
	}

	// Validação da marca
	if !ValidarMarca(novoCarro.Marca) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Marca inválida. Use letras, números e espaços"})
		return
	}

	// Validação do modelo
	if !ValidarModelo(novoCarro.Modelo) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Modelo inválido. Use letras, números e espaços"})
		return
	}

	// Validação do ano (obrigatório)
	if !ValidarAno(novoCarro.Ano) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ano obrigatório e maior que zero"})
		return
	}

	// Validação de Km e Valor (opcionais)
	novoCarro.Km = ValidarKm(novoCarro.Km)
	novoCarro.Valor = ValidarValor(novoCarro.Valor)

	// Criar carro no banco
	if err := CreateCarro(&novoCarro); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar o carro"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Carro criado"})
}

// Buscar carro por placa
func GetCarroByID_C(c *gin.Context) {
	placa := c.Param("placa")

	// Validação de placa para busca, garante que não sejam feitas consultas inválidas ao banco.
	if !ValidarPlaca(placa) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placa inválida. Use formato ABC-1234 ou ABC1D23"})
		return
	}

	// Padroniza placa antes da consulta
	placa = PadronizarPlaca(placa)

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

	// Validação de placa antes de atualizar
	if !ValidarPlaca(placa) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placa inválida. Use formato ABC-1234 ou ABC1D23"})
		return
	}

	// Padroniza placa antes de buscar
	placa = PadronizarPlaca(placa)

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

	// Validação da cor
	if !ValidarCor(carroEncontrado.Cor) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cor inválida. Use apenas letras e espaços"})
		return
	}

	// Validação da marca
	if !ValidarMarca(carroEncontrado.Marca) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Marca inválida. Use letras, números e espaços"})
		return
	}

	// Validação do modelo
	if !ValidarModelo(carroEncontrado.Modelo) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Modelo inválido. Use letras, números e espaços"})
		return
	}

	// Validação do ano
	if !ValidarAno(carroEncontrado.Ano) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ano obrigatório e maior que zero"})
		return
	}

	// Validação de Km e Valor (opcionais)
	carroEncontrado.Km = ValidarKm(carroEncontrado.Km)
	carroEncontrado.Valor = ValidarValor(carroEncontrado.Valor)

	if err := UpdateCarro(carroEncontrado); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar o carro"})
		return
	}

	c.JSON(http.StatusOK, carroEncontrado)
}

// Deletar carro
func DeleteCarro_C(c *gin.Context) {
	placa := c.Param("placa")

	// Validação de placa para exclusão
	if !ValidarPlaca(placa) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placa inválida. Use formato ABC-1234 ou ABC1D23"})
		return
	}

	// Padroniza placa antes da exclusão
	placa = PadronizarPlaca(placa)

	if err := DeleteCarro(placa); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar o carro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Carro deletado com sucesso"})
}
