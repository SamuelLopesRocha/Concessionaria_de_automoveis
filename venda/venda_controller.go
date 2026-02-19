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
	IdCarro       string  `json:"id_carro"`
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

	if input.ValorVenda <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "valor_venda deve ser maior que zero",
		})
		return
	}

	// =========================
	// CLIENTE
	// =========================
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

	// =========================
	// VENDA
	// =========================
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

	vendaExistente, err := GetVendaById(id)
	if err != nil {
		c.JSON(404, gin.H{"error": "Venda não encontrada"})
		return
	}

	var input VendaInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// =========================
	// ATUALIZA VENDA
	// =========================
	vendaExistente.DataVenda = input.DataVenda
	vendaExistente.ValorVenda = input.ValorVenda
	vendaExistente.FormaPgto = input.FormaPgto
	vendaExistente.Parcelas = input.Parcelas
	vendaExistente.Juros = input.Juros
	vendaExistente.Desconto = input.Desconto
	vendaExistente.ComissaoVend = input.Comissao

	// =========================
	// CLIENTE
	// =========================
	if vendaExistente.ClienteID == 0 {

		novoCliente := cliente.Cliente{
			Nome:     input.Nome,
			CPF:      input.CPF,
			Telefone: input.Telefone,
			Email:    input.Email,
		}

		if err := config.DB.Create(&novoCliente).Error; err != nil {
			c.JSON(500, gin.H{"error": "Erro ao criar cliente"})
			return
		}

		vendaExistente.ClienteID = novoCliente.ID

	} else {

		var cli cliente.Cliente

		if err := config.DB.First(&cli, vendaExistente.ClienteID).Error; err == nil {

			cli.Nome = input.Nome
			cli.CPF = input.CPF
			cli.Telefone = input.Telefone
			cli.Email = input.Email

			config.DB.Save(&cli)
		}
	}

	// =========================
	// SALVA VENDA (USA SUA FUNÇÃO)
	// =========================
	if err := UpdateVenda(vendaExistente); err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, vendaExistente)
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
