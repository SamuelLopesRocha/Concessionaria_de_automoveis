package carro

// Carro representa o modelo de um carro.
// As tags 'json' são usadas para serialização e desserialização JSON em sua API.
// As tags 'gorm' são usadas pelo GORM para mapear o struct para a tabela do banco de dados.
type Carro struct {
	Placa  string  `json:"placa" gorm:"primaryKey" binding:"required"` // 'Placa' é a chave primária
	Cor    string  `json:"cor" gorm:"type:varchar(100);not null"`
	Marca  string  `json:"marca" gorm:"type:varchar(100);not null"`
	Modelo string  `json:"modelo" gorm:"type:varchar(100);not null"`
	Valor  float64 `json:"valor"`
	Km     float32 `json:"km" gorm:"not null"`
	Ano    int     `json:"ano" gorm:"not null"`
}
