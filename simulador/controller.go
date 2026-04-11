package simulador

import (
	"net/http"

	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/carro"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"github.com/gin-gonic/gin"
)

type SimulacaoRequest struct {
	Placa    string  `json:"placa"`
	Desconto float64 `json:"desconto"`
	Entrada  float64 `json:"entrada"`
	Juros    float64 `json:"juros"`
	Parcelas int     `json:"parcelas"`
}

type SimulacaoResponse struct {
	ValorOriginal    float64 `json:"valor_original"`
	ValorComDesconto float64 `json:"valor_com_desconto"`
	SaldoFinanciado  float64 `json:"saldo_financiado"`
	ValorTotal       float64 `json:"valor_total"`
	ValorParcela     float64 `json:"valor_parcela"`
}

func Simular(c *gin.Context) {
	var req SimulacaoRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "dados inválidos"})
		return
	}

	if req.Parcelas <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "parcelas deve ser maior que zero"})
		return
	}

	if req.Desconto < 0 || req.Entrada < 0 || req.Juros < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "valores não podem ser negativos"})
		return
	}

	var carroEncontrado carro.Carro
	if err := config.DB.First(&carroEncontrado, "placa = ?", req.Placa).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "carro não encontrado"})
		return
	}

	valorOriginal := carroEncontrado.Valor
	valorComDesconto := valorOriginal - req.Desconto

	if valorComDesconto < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "desconto maior que o valor do carro"})
		return
	}

	saldoFinanciado := valorComDesconto - req.Entrada
	if saldoFinanciado < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "entrada maior que o valor negociado"})
		return
	}

	valorTotal := saldoFinanciado + (saldoFinanciado * req.Juros / 100)
	valorParcela := valorTotal / float64(req.Parcelas)

	resp := SimulacaoResponse{
		ValorOriginal:    valorOriginal,
		ValorComDesconto: valorComDesconto,
		SaldoFinanciado:  saldoFinanciado,
		ValorTotal:       valorTotal,
		ValorParcela:     valorParcela,
	}

	c.JSON(http.StatusOK, resp)
}
