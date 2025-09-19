//go get gorm.io/driver/postgres - biblioteca oficial do GORM para PostgreSQL.
//go get github.com/lib/pq - Esse é outro driver PostgreSQL para Go.
//psql -U postgres -d postgres  - Esse é um comando do terminal para entrar no PostgreSQL.

// - \l       			-- lista todos os bancos
// - \c nome_do_banco   -- conecta em outro banco == sempre digitar \c concessionaria
//  - \dt      			-- lista tabelas
// - \d nome_da_tabela  -- mostra detalhes da tabela == \d carros
// - \q      			-- sai do psql

//C:\Program Files\PostgreSQL\17\data\base -- Caminho das pastas onde ficam os bancos de dados

//exemplo get // SELECT * FROM carros;
//exemplo get por ID == SELECT * FROM carros WHERE placa = 'ABC1234'; //////// Por Padrão sempre é minuscula

package config

import (
    "fmt"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
    // Configurações de conexão
    host := "localhost"                 // Diz onde o banco está rodando.   Se o banco estivesse em outro servidor, seria o IP ou domínio dele. 
    port := 5432                        // 5432 é a porta padrão do PostgreSQL quando instala.
    user := "postgres"                  // Quando você instala o PostgreSQL, ele cria automaticamente um usuário administrador chamado postgres.
    password := "45114806"              //É a senha do usuário escolhida quando instala o postgres nesse caso.
    dbname := "concessionaria"

    // Monta a string de conexão
    dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=America/Sao_Paulo",
        host, user, password, dbname, port,
    )

    // Abre a conexão
    database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        panic("Falha ao conectar ao PostgreSQL")
    }

    DB = database
}