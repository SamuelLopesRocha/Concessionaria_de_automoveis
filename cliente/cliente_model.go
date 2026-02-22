package cliente

import (
	"time"

	"gorm.io/gorm"
)

type StatusEmail string

const (
	NaoEnviado StatusEmail = "NAO_ENVIADO"
	Pendente   StatusEmail = "PENDENTE"
	Verificado StatusEmail = "VERIFICADO"
)

type Cliente struct {
	gorm.Model

	Nome     string `json:"nome" gorm:"not null"`
	CPF      string `json:"cpf" gorm:"unique;not null"`
	Telefone string `json:"telefone"`
	Email    string `json:"email" gorm:"not null"`

	// Controle de Email
	StatusEmail StatusEmail `json:"status_email" gorm:"type:varchar(20);default:'NAO_ENVIADO'"`

	DataEnvioEmail       *time.Time `json:"data_envio_email"`
	DataConfirmacaoEmail *time.Time `json:"data_confirmacao_email"`
	TentativasEnvio      int        `json:"tentativas_envio" gorm:"default:0"`
}
