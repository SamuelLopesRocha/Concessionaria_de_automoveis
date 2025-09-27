package funcionario

import "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"

// Buscar todos os funcionarios
func GetAllFuncs() ([]Funcionario, error) {
	var funcs []Funcionario
	result := config.DB.Find(&funcs)
	return funcs, result.Error
}

// Criar novo funcionario
func CreateFunc(funci *Funcionario) error {
	result := config.DB.Create(funci)
	return result.Error
}

// Buscar funcionario por ID
func GetFuncByID(id string) (*Funcionario, error) {
	var funci Funcionario
	result := config.DB.First(&funci, "id = ?", id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &funci, nil
}

// evitar duplicidade do CPF
func GetFuncByCPF(cpf string) (*Funcionario, error) {
	var f Funcionario
	if err := config.DB.Where("cpf = ?", cpf).First(&f).Error; err != nil {
		return nil, err
	}
	return &f, nil
}

// Atualizar funcionario
func UpdateFunc(funci *Funcionario) error {
	result := config.DB.Save(funci)
	return result.Error
}

// Deletar funcionario
func DeleteFunc(id string) error {
	result := config.DB.Delete(&Funcionario{}, "id = ?", id)
	return result.Error
}
