package config

import (
    "fmt"
    "github.com/glebarez/sqlite"
    "gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
    database, err := gorm.Open(sqlite.Open("banco.db"), &gorm.Config{})
    if err != nil {
        fmt.Println(err)
        panic("Erro ao conectar ao banco")
    }

    DB = database
}
