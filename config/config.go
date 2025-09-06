package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPassword, dbHost, dbName)

	var err error

	// Tenta se conectar em um loop com GORM
	for i := 0; i < 10; i++ {
		DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			fmt.Println("Conexão com o banco de dados MySQL estabelecida com sucesso!")
			return
		}

		log.Printf("Tentativa de conexão %d falhou: %v", i+1, err)
		time.Sleep(5 * time.Second) // Espera 5 segundos antes de tentar novamente
	}

	log.Fatalf("Não foi possível conectar ao banco de dados após várias tentativas.")
}
