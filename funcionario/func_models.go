package funcionario

type Funcionario struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Nome  string `json:"nome"`
	Cargo string `json:"cargo"`
	Idade int    `json:"idade"`
	Cpf   string `json:"cpf"`
}
