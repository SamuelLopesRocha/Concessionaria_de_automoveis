package funcionario

type Funcionario struct {
	Id    uint   `json:"id" gorm:"primaryKey;autoIncrement"`
	Cpf   string `json:"cpf" gorm:"size:11;not null;uniqueIndex"`
	Nome  string `json:"nome" binding:"required"`
	Cargo string `json:"cargo" gorm:"type:varchar(50);not null"`
	Idade int    `json:"idade" gorm:"not null"`
}
