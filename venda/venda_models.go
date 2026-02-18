package venda

import (
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/carro"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/cliente"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/funcionario"
)

type Venda struct {
	ID uint `gorm:"primaryKey;column:id" json:"id"`

	CarroID uint        `gorm:"column:carro_id" json:"id_carro"`
	Carro   carro.Carro `gorm:"foreignKey:CarroID"`

	FuncionarioID uint                    `gorm:"column:funcionario_id" json:"id_funcionario"`
	Funcionario   funcionario.Funcionario `gorm:"foreignKey:FuncionarioID"`

	ClienteID uint            `gorm:"column:cliente_id" json:"cliente_id"`
	Cliente   cliente.Cliente `gorm:"foreignKey:ClienteID"`

	DataVenda string `gorm:"column:data_venda" json:"data_venda"`

	ValorVenda float64 `gorm:"column:valor_venda;not null" json:"valor_venda"`

	FormaPgto string `gorm:"column:forma_pgto" json:"forma_pgto"`

	Parcelas int `gorm:"column:parcelas" json:"parcelas"`

	Juros float64 `gorm:"column:juros" json:"juros"`

	Desconto float64 `gorm:"column:desconto" json:"desconto"`

	ComissaoVend float64 `gorm:"column:comissao_vend" json:"comissao_vend"`
}
