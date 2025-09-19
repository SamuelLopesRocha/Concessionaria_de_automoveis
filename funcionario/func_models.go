package funcionario

type Funcionario struct {
    Id    uint   `json:"id" gorm:"primaryKey;autoIncrement"` 
	Cpf string `json:"cpf" gorm:"not null"`
    Nome  string `json:"nome" binding:"required"` // Nome obrigatório
    Cargo  string `json:"cargo" gorm:"type:varchar(50);not null"`
	Idade int `json:"idade" gorm:"not null"`
}
