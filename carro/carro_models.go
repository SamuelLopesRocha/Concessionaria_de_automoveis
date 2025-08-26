package carro      // vai ser importado como "models.carro_model"

type Carro struct {
    placa   string `json:"placa" gorm:"primaryKey"` // Placa de Carro
    cor string `json:"cor" gorm:"type:varchar(100);not null"`
    marca string `json:"marca" gorm:"type:varchar(100);not null"`
	modelo string `json:"modelo" gorm:"type:varchar(100);not null"`
	valor string `json:"recursos" gorm:"type:varchar(100)"`
	km  string `json:"km " gorm:"type:varchar(100);not null"`
}
