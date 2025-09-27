package funcionario

import (
	"errors"

	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"gorm.io/gorm"
)

func GetAllFuncs() ([]Funcionario, error) {
	var funcs []Funcionario
	result := config.DB.Find(&funcs)
	return funcs, result.Error
}

func CreateFunc(f *Funcionario) error {
	return config.DB.Create(f).Error
}

func GetFuncByID(id string) (*Funcionario, error) {
	var f Funcionario
	result := config.DB.First(&f, "id = ?", id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, gorm.ErrRecordNotFound
	}
	return &f, result.Error
}

func GetFuncByCPF(cpf string) (*Funcionario, error) {
	var f Funcionario
	result := config.DB.Where("cpf = ?", cpf).First(&f)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, gorm.ErrRecordNotFound
	}
	return &f, result.Error
}

func UpdateFunc(f *Funcionario) error {
	return config.DB.Save(f).Error
}

func DeleteFunc(id string) error {
	return config.DB.Delete(&Funcionario{}, "id = ?", id).Error
}
