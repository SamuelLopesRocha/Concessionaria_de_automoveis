package cliente

import "gorm.io/gorm"

type Cliente struct {
	gorm.Model

	Nome     string `json:"nome" gorm:"not null"`
	CPF      string `json:"cpf" gorm:"unique;not null"`
	Telefone string `json:"telefone"`
	Email    string `json:"email"`
}
