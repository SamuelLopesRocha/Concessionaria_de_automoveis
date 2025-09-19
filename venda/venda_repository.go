package venda

import "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"

// Buscar todos os registro de venda
func GetAllVendas() ([]Venda, error) {
	var vendas []Venda
	result := config.DB.Find(&vendas)
	return vendas, result.Error
}

// Criar novo registro de venda
func CreateVenda(venda *Venda) error {
	result := config.DB.Create(venda)
	return result.Error
}

// Buscar registro de venda por ID
func GetVendaById(id string) (*Venda, error) {
	var venda Venda
	result := config.DB.First(&venda, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &venda, nil
}

// Atualizar registro de venda
func UpdateVenda(venda *Venda) error {
	result := config.DB.Save(venda)
	return result.Error
}

// Deletar registro de venda
func DeleteVenda(id string) error {
	result := config.DB.Delete(&Venda{}, "id = ?", id)
	return result.Error
}
