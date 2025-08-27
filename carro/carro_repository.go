package carro

import "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"

// Buscar todos os carros
func GetAllCarros() ([]Carro, error) {
	var carros []Carro
	result := config.DB.Find(&carros)
	return carros, result.Error
}

// Criar novo carro
func CreateCarro(carro *Carro) error {
	result := config.DB.Create(carro)
	return result.Error
}

// Buscar carro por placa
func GetCarroByPlaca(placa string) (*Carro, error) {
	var carro Carro
	result := config.DB.First(&carro, "placa = ?", placa)
	if result.Error != nil {
		return nil, result.Error
	}
	return &carro, nil
}

// Atualizar carro
func UpdateCarro(carro *Carro) error {
	result := config.DB.Save(carro)
	return result.Error
}

// Deletar carro
func DeleteCarro(placa string) error {
	result := config.DB.Delete(&Carro{}, "placa = ?", placa)
	return result.Error
}
