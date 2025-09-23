package config

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	// Pegue a connection string no painel do Supabase
	dsn := "postgresql://postgres.wppccojpdepskicplfvf:Katherine26122005*@aws-1-sa-east-1.pooler.supabase.com:6543/postgres"

	// Abre a conexão
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("❌ Falha ao conectar ao PostgreSQL do Supabase")
	}

	DB = database
}
