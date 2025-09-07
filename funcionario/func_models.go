package funcionario

type Funcionario struct {
    Id    uint   `json:"reserva_id" gorm:"primaryKey;autoIncrement"` 
	Cpf string `json:"cpf" gorm:"not null"`
    Nome  string `json:"nome" binding:"required"` // Nome obrigatório
    Cargo  string `json:"marca" gorm:"type:varchar(50);not null"`
	Idade int `json:"idade" gorm:"not null"`
}
