package compra

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

// Valida o valor da compra (obrigatório e > 0)
func ValidarValorCompra(valor float32) bool {
	return valor > 0
}

// Valida o débito (não pode ser negativo)
func ValidarDebito(debito float32) bool {
	return debito >= 0
}

// Valida o valor da parcela (se informado, deve ser positivo)
func ValidarValorParcela(valor float32) bool {
	return valor >= 0
}

// Valida quantidade de parcelas (>=1, limite opcional 120)
func ValidarParcelas(parcelas int) bool {
	return parcelas >= 1 && parcelas <= 120
}

// Valida fornecedor (obrigatório, apenas letras, números e espaços)
func ValidarFornecedor(fornecedor string) bool {
	fornecedor = strings.TrimSpace(fornecedor)
	if len(fornecedor) == 0 {
		return false
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ0-9\s]+$`)
	return re.MatchString(fornecedor)
}

// Placa no formato brasileiro (ABC-1234 ou ABC1D23)
func ValidarPlaca(placa string) bool {
	re := regexp.MustCompile(`^[A-Z]{3}-?\d[A-Z0-9]\d{2}$`)
	return re.MatchString(strings.ToUpper(placa))
}

// Padronizar placa (remove hífen e deixa maiúscula)
func PadronizarPlaca(placa string) string {
	placa = strings.ToUpper(placa)
	return strings.ReplaceAll(placa, "-", "")
}

// Cor (obrigatória, apenas letras e espaços)
func ValidarCor(cor string) bool {
	if len(strings.TrimSpace(cor)) == 0 {
		return false
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ\s]+$`)
	return re.MatchString(cor)
}

// Marca (obrigatória, pode ter letras, números e espaços)
func ValidarMarca(marca string) bool {
	marca = strings.TrimSpace(marca)
	if len(marca) == 0 {
		return false
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ0-9\s]+$`)
	return re.MatchString(marca)
}

// Modelo (obrigatório, letras, números e espaços)
func ValidarModelo(modelo string) bool {
	modelo = strings.TrimSpace(modelo)
	if len(modelo) == 0 {
		return false
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ0-9\s]+$`)
	return re.MatchString(modelo)
}

// Ano do carro (entre 1900 e 2030)
func ValidarAno(ano int) bool {
	return ano > 1900 && ano <= 2030
}

// Km do carro (se negativo assume 0)
func ValidarKm(km float32) float32 {
	if km < 0 {
		return 0
	}
	return km
}

// Buscar todos os registros de compra
func GetCompras(c *gin.Context) {
	compras, err := GetAllCompras()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar os registros de compra"})
		return
	}
	c.JSON(http.StatusOK, compras)
}

// Criar novo registro de compra
func CreateCompra_C(c *gin.Context) {
	var novaCompra Compra
	if err := c.ShouldBindJSON(&novaCompra); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	// ----- Validações de compra -----
	if !ValidarValorCompra(novaCompra.Valor_Compra) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor da compra deve ser maior que zero"})
		return
	}
	if !ValidarDebito(novaCompra.Debito) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Débito não pode ser negativo"})
		return
	}
	if !ValidarValorParcela(novaCompra.Valor_Parcela) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor da parcela inválido"})
		return
	}
	if !ValidarParcelas(novaCompra.Parcelas) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Número de parcelas inválido"})
		return
	}
	if !ValidarFornecedor(novaCompra.Fornecedor) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fornecedor inválido. Use apenas letras, números e espaços"})
		return
	}

	// ----- Validações do carro -----
	if !ValidarPlaca(novaCompra.Placa) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placa inválida. Use o formato ABC-1234 ou ABC1D23"})
		return
	}
	novaCompra.Placa = PadronizarPlaca(novaCompra.Placa)

	if !ValidarCor(novaCompra.Cor) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cor inválida. Use apenas letras e espaços"})
		return
	}
	if !ValidarMarca(novaCompra.Marca) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Marca inválida"})
		return
	}
	if !ValidarModelo(novaCompra.Modelo) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Modelo inválido"})
		return
	}
	if !ValidarAno(novaCompra.Ano) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ano inválido. Deve estar entre 1900 e 2030"})
		return
	}
	novaCompra.Km = ValidarKm(novaCompra.Km)

	// Criar registro no banco
	if err := CreateCompra(&novaCompra); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar o registro de compra"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registro criado com sucesso"})
}

// Buscar registro de compra por ID
func GetCompraByID_C(c *gin.Context) {
	id := c.Param("id")

	compraEncontrada, err := GetCompraById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Registro não encontrado"})
		return
	}

	c.JSON(http.StatusOK, compraEncontrada)
}

// Atualizar registro de compra
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

	// ----- Validações de compra -----
	if !ValidarValorCompra(compraEncontrada.Valor_Compra) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor da compra deve ser maior que zero"})
		return
	}
	if !ValidarDebito(compraEncontrada.Debito) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Débito não pode ser negativo"})
		return
	}
	if !ValidarValorParcela(compraEncontrada.Valor_Parcela) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor da parcela inválido"})
		return
	}
	if !ValidarParcelas(compraEncontrada.Parcelas) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Número de parcelas inválido"})
		return
	}
	if !ValidarFornecedor(compraEncontrada.Fornecedor) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Fornecedor inválido. Use apenas letras, números e espaços"})
		return
	}

	// ----- Validações do carro -----
	if !ValidarPlaca(compraEncontrada.Placa) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Placa inválida. Use o formato ABC-1234 ou ABC1D23"})
		return
	}
	compraEncontrada.Placa = PadronizarPlaca(compraEncontrada.Placa)

	if !ValidarCor(compraEncontrada.Cor) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cor inválida. Use apenas letras e espaços"})
		return
	}
	if !ValidarMarca(compraEncontrada.Marca) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Marca inválida"})
		return
	}
	if !ValidarModelo(compraEncontrada.Modelo) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Modelo inválido"})
		return
	}
	if !ValidarAno(compraEncontrada.Ano) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ano inválido. Deve estar entre 1900 e 2030"})
		return
	}
	compraEncontrada.Km = ValidarKm(compraEncontrada.Km)

	// Atualizar no banco
	if err := UpdateCompra(compraEncontrada); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar o registro"})
		return
	}

	c.JSON(http.StatusOK, compraEncontrada)
}

// Deletar registro de compra
func DeleteCompra_C(c *gin.Context) {
	id := c.Param("id")

	if err := DeleteCompra(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar o registro"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registro deletado com sucesso"})
}
