package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/carro"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"
	"github.com/SamuelLopesRocha/Concessionaria_de_automoveis/funcionario"
)

// A função connectDB agora é responsável por tentar conectar ao banco de dados repetidamente.
func connectDB() *gorm.DB {
	// Acessa as variáveis de ambiente do docker-compose
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")
	dbHost := os.Getenv("DB_HOST")

	// Monta a string de conexão para o GORM
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPassword, dbHost, dbName)

	var db *gorm.DB
	var err error

	// Loop de tentativas de conexão
	for i := 0; i < 5; i++ {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			sqlDB, err := db.DB()
			if err == nil {
				err = sqlDB.Ping()
				if err == nil {
					log.Println("Conexão com o banco de dados MySQL estabelecida com sucesso!")
					return db
				}
			}
		}

		log.Printf("Tentativa de conexão %d falhou, aguardando 5 segundos: %v", i+1, err)
		time.Sleep(5 * time.Second)
	}

	log.Fatalf("Não foi possível conectar ao banco de dados após várias tentativas.")
	return nil
}

func main() {
	// Substitui a chamada antiga por nossa nova função
	config.DB = connectDB()

	// Migra os modelos
	err := config.DB.AutoMigrate(&carro.Carro{}, &funcionario.Funcionario{})
	if err != nil {
		log.Fatalf("Falha na migração do banco de dados: %v", err)
	}

	// Cria o roteador Gin
	r := gin.Default()

	// Registra as rotas
	carro.CarroRoutes(r)
	funcionario.FuncRoutes(r)

	// Roda o servidor na porta 6000
	r.Run("0.0.0.0:6000")
}
