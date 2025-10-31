package venda

import (
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/carro"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/funcionario"
)

type Venda struct {
	Id               uint    `json:"id_venda" gorm:"primaryKey;autoIncrement"`
	IDCarro          string    `json:"id_carro"`
	Carro carro.Carro `json:"carro" gorm:"foreignKey:IDCarro"`
	IDFuncionario       uint    `json:"id_funcionario"`
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
	Funcionario     funcionario.Funcionario `json:"funcionario" gorm:"foreignKey:IDFuncionario"`
	CPF      string `json:"cpf"`

}
