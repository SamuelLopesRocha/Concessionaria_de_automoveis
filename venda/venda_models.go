package venda

type Venda struct {
	Id               uint    `json:"id_venda" gorm:"primaryKey;autoIncrement"`
	IDCarro          uint    `json:"id_carro"`
	IDVendedor       uint    `json:"id_vendedor"`
	DataVenda        string  `json:"data_venda"`
	Valor_Venda  	float32 `json:"valor_venda" gorm:"not null"`
	ValorTotal       float64 `json:"valor_total"`
	Debito        	float32 `json:"debito"`
	Valor_Parcela 	float32 `json:"valor_parcela"`
	Parcelas         int     `json:"parcelas"`        // se parcelado
	Juros            float64 `json:"juros"`           // percentual
	Desconto         float64 `json:"desconto"`
	ComissaoVendedor float64 `json:"comissao_vendedor"`

	//dados do cliente
	Nome     string `json:"nome"`
	CPF      string `json:"cpf" gorm:"unique"`
	Telefone string `json:"telefone"`
	Endereco string `json:"endereco"`
	Email    string `json:"email" gorm:"unique"`
}
