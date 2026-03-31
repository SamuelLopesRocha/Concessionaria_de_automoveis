package config

import (
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		panic("❌ Variável de ambiente DATABASE_URL não definida!")
	}

	database, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // resolve bug stmtcache
	}), &gorm.Config{})

	if err != nil {
		panic("❌ Falha ao conectar ao PostgreSQL do Supabase")
	}

	DB = database
}
