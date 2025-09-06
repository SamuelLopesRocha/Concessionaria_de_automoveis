package carro

import "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"

// GetAllCarros busca todos os carros do banco de dados.
func GetAllCarros() ([]Carro, error) {
	var carros []Carro
	result := config.DB.Find(&carros)
	return carros, result.Error
}

// CreateCarro insere um novo carro no banco de dados.
func CreateCarro(carro *Carro) error {
	result := config.DB.Create(carro)
	return result.Error
}

// GetCarroByPlaca busca um único carro pela placa.
func GetCarroByPlaca(placa string) (*Carro, error) {
	var carro Carro
	result := config.DB.First(&carro, "placa = ?", placa)
	if result.Error != nil {
		return nil, result.Error
	}
	return &carro, nil
}

// UpdateCarro atualiza os dados de um carro no banco de dados.
func UpdateCarro(carro *Carro) error {
	result := config.DB.Save(carro)
	return result.Error
}

// DeleteCarro deleta um carro do banco de dados pela placa.
func DeleteCarro(placa string) error {
	result := config.DB.Delete(&Carro{}, "placa = ?", placa)
	return result.Error
}
