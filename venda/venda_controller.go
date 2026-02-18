package venda

import (
	"net/http"

	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/cliente"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"github.com/gin-gonic/gin"
)

//
// =======================
// INPUT
// =======================
//

type VendaInput struct {
	IdCarro       uint    `json:"id_carro"`
	IdFuncionario uint    `json:"id_funcionario"`
	DataVenda     string  `json:"data_venda"`
	ValorVenda    float64 `json:"valor_venda"`
	FormaPgto     string  `json:"forma_pgto"`
	Parcelas      int     `json:"parcelas"`
	Juros         float64 `json:"juros"`
	Desconto      float64 `json:"desconto"`
	Comissao      float64 `json:"comissao_vend"`

	Nome     string `json:"nome"`
	CPF      string `json:"cpf"`
	Telefone string `json:"telefone"`
	Email    string `json:"email"`
}

//
// =======================
// GET /vendas
// =======================
//

func GetVendas(c *gin.Context) {
	vendas, err := GetAllVendas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, vendas)
}

//
// =======================
// GET /vendas/:id
// =======================
//

func GetVendaByID_C(c *gin.Context) {
	id := c.Param("id")

	venda, err := GetVendaById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Venda não encontrada"})
		return
	}

	c.JSON(http.StatusOK, venda)
}

//
// =======================
// POST /vendas
// =======================
//

func CreateVenda_C(c *gin.Context) {
	var input VendaInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 🔴 PROTEÇÃO REAL CONTRA NULL NO BANCO
	if input.ValorVenda <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "valor_venda é obrigatório e deve ser maior que zero",
		})
		return
	}

	// 🔹 Cliente
	var cli cliente.Cliente
	err := config.DB.Where("cpf = ?", input.CPF).First(&cli).Error

	if err != nil {
		cli = cliente.Cliente{
			Nome:     input.Nome,
			CPF:      input.CPF,
			Telefone: input.Telefone,
			Email:    input.Email,
		}

		if err := config.DB.Create(&cli).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "erro ao criar cliente",
			})
			return
		}
	}

	// 🔹 Venda
	venda := Venda{
		CarroID:       input.IdCarro,
		FuncionarioID: input.IdFuncionario,
		ClienteID:     cli.ID,
		DataVenda:     input.DataVenda,
		ValorVenda:    input.ValorVenda,
		FormaPgto:     input.FormaPgto,
		Parcelas:      input.Parcelas,
		Juros:         input.Juros,
		Desconto:      input.Desconto,
		ComissaoVend:  input.Comissao,
	}

	if err := CreateVenda(&venda); err != nil {
		println("ERRO REAL AO CRIAR VENDA:", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, venda)
}

//
// =======================
// PUT /vendas/:id
// =======================
//

func UpdateVenda_C(c *gin.Context) {
	id := c.Param("id")

	venda, err := GetVendaById(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Venda não encontrada"})
		return
	}

	if err := c.ShouldBindJSON(venda); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := UpdateVenda(venda); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, venda)
}

//
// =======================
// DELETE /vendas/:id
// =======================
//

func DeleteVenda_C(c *gin.Context) {
	id := c.Param("id")

	if err := DeleteVenda(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Venda deletada com sucesso",
	})
}
