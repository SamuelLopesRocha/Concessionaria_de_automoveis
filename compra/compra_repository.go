package compra

import "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"

// Buscar todos os registro de compra
func GetAllCompras() ([]Compra, error) {
	var compras []Compra
	result := config.DB.Find(&compras)
	return compras, result.Error
}

// Criar novo registro de compra
func CreateCompra(compra *Compra) error {
	result := config.DB.Create(compra)
	return result.Error
}

// Buscar carro por id do registro de compra
func GetCompraById(id string) (*Compra, error) {
	var compra Compra
	result := config.DB.First(&compra, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &compra, nil
}

// Atualizar registro de compra
func UpdateCompra(compra *Compra) error {
	result := config.DB.Save(compra)
	return result.Error
}

// Deletar carro
func DeleteCompra(id string) error {
	result := config.DB.Delete(&Compra{}, "id = ?", id)
	return result.Error
}
