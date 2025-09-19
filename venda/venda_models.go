package venda

type Venda struct {
    Id          	 uint      `json:"id_venda" gorm:"primaryKey;autoIncrement"`
    IDCliente        uint      `json:"id_cliente"`
    IDCarro          uint      `json:"id_carro"`
	IDVendedor       uint      `json:"id_vendedor"`
    DataVenda        string    `json:"data_venda"`
    ValorTotal       float64   `json:"valor_total"`
    FormaPagamento   string    `json:"forma_pagamento"` // "à vista" ou "parcelado"
    Parcelas         int       `json:"parcelas"`        // se parcelado
    Juros            float64   `json:"juros"`           // percentual
    Desconto         float64   `json:"desconto"`
    ComissaoVendedor float64   `json:"comissao_vendedor"`

	/* Cliente se possivel fazer no mesmo CRUD senão criar outro
	IDCliente uint   `json:"id_cliente" gorm:"primaryKey;autoIncrement"`
    Nome      string `json:"nome"`
    CPF       string `json:"cpf" gorm:"unique"`
    Telefone  string `json:"telefone"`
    Endereco  string `json:"endereco"`
	*/
}

