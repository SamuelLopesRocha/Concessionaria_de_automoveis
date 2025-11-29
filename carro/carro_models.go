package carro

type Carro struct {
	Placa   string  `json:"placa" gorm:"primaryKey" ` // Placa obrigatória
	Cor     string  `json:"cor" gorm:"type:varchar(100);not null"`
	Marca   string  `json:"marca" gorm:"type:varchar(100);not null"`
	Modelo  string  `json:"modelo" gorm:"type:varchar(100);not null"`
	Valor   float64 `json:"valor"`
	Km      float32 `json:"km" gorm:"not null"`
	Ano     int     `json:"ano" gorm:"not null"`
	FotoUrl string  `json:"foto_url" gorm:"type:varchar(500)"`
}
