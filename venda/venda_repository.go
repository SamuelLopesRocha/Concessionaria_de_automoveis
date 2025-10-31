package venda

import ("strconv"
"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
)

// Buscar todos os registro de venda
func GetAllVendas() ([]Venda, error) {
	var vendas []Venda
	result := config.DB.Preload("Carro").Preload("Funcionario").Find(&vendas)
	return vendas, result.Error
}

// Criar novo registro de venda
func CreateVenda(venda *Venda) error {
	result := config.DB.Create(venda)
	return result.Error
}

// Buscar registro de venda por ID
func GetVendaById(idString string) (*Venda, error) {
	
	// 2. CONVERTA A STRING PARA UM INTEIRO
	id, err := strconv.Atoi(idString)
	if err != nil {
		// Se o ID não for um número, retorna um erro.
		// O controller (GetVendaByID_C) vai transformar isso em 400 Bad Request
		return nil, err 
	}

	// 3. FAÇA A BUSCA COM O 'id' (AGORA UM INT)
	var venda Venda
	// Use o 'id' (inteiro) na consulta
	result := config.DB.Preload("Carro").Preload("Funcionario").First(&venda, "id = ?", id) 
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
