package compra

// Dados do Registro de Compra
type Compra struct {
	ID    uint   `json:"id" gorm:"primaryKey;autoIncrement"` //so trocar o uint por str
	Valor_Compra  float32 `json:"valor_compra" gorm:"not null"`
	Debito        float32 `json:"debito"`
	Valor_Parcela float32 `json:"valor_parcela"`
	Parcelas      int     `json:"parcelas"`
	Fornecedor    string  `json:"fornecedor" gorm:"type:varchar(100)"`

	// Dados do carro comprado
	Placa  string  `json:"placa" gorm:"type:varchar(20);not null"`
	Cor    string  `json:"cor" gorm:"type:varchar(100);not null"`
	Marca  string  `json:"marca" gorm:"type:varchar(100);not null"`
	Modelo string  `json:"modelo" gorm:"type:varchar(100);not null"`
	Km     float32 `json:"km" gorm:"not null"`
	Ano    int     `json:"ano" gorm:"not null"`
}