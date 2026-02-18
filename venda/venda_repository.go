package venda

import (
	"strconv"

	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
)

func GetAllVendas() ([]Venda, error) {
	var vendas []Venda
	result := config.DB.
		Preload("Carro").
		Preload("Funcionario").
		Preload("Cliente").
		Find(&vendas)
	return vendas, result.Error
}

func CreateVenda(v *Venda) error {
	return config.DB.Create(v).Error
}

func GetVendaById(idString string) (*Venda, error) {
	id, err := strconv.Atoi(idString)
	if err != nil {
		return nil, err
	}

	var venda Venda
	result := config.DB.
		Preload("Carro").
		Preload("Funcionario").
		Preload("Cliente").
		First(&venda, id)

	if result.Error != nil {
		return nil, result.Error
	}

	return &venda, nil
}

func UpdateVenda(v *Venda) error {

	var vendaExistente Venda

	// Busca a venda atual
	if err := config.DB.First(&vendaExistente, v.ID).Error; err != nil {
		return err
	}

	// Atualiza apenas campos permitidos
	return config.DB.Model(&vendaExistente).Updates(map[string]interface{}{
		"data_venda":    v.DataVenda,
		"valor_venda":   v.ValorVenda,
		"forma_pgto":    v.FormaPgto,
		"parcelas":      v.Parcelas,
		"juros":         v.Juros,
		"desconto":      v.Desconto,
		"comissao_vend": v.ComissaoVend,
	}).Error
}

func DeleteVenda(idString string) error {
	id, err := strconv.Atoi(idString)
	if err != nil {
		return err
	}
	return config.DB.Delete(&Venda{}, id).Error
}
