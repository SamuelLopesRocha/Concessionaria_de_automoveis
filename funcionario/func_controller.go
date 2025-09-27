package funcionario

import (
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

// ===== Validações =====

func ValidarNome(nome string) bool {
	nome = strings.TrimSpace(nome)
	if len(nome) == 0 {
		return false
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ\s]+$`)
	return re.MatchString(nome)
}

func ValidarCargo(cargo string) bool {
	cargo = strings.TrimSpace(cargo)
	if len(cargo) == 0 {
		return false
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ\s]+$`)
	return re.MatchString(cargo)
}

func PadronizarCPF(cpf string) string {
	cpf = strings.TrimSpace(cpf)
	cpf = strings.ReplaceAll(cpf, ".", "")
	cpf = strings.ReplaceAll(cpf, "-", "")
	return cpf
}

func ValidarCPF(cpf string) bool {
	cpf = PadronizarCPF(cpf)
	re := regexp.MustCompile(`^[0-9]{11}$`)
	return re.MatchString(cpf)
}

func ValidarIdade(idade int) bool {
	return idade >= 16 && idade <= 100
}

// ===== Handlers =====

func GetFuncs(c *gin.Context) {
	funcs, err := GetAllFuncs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar funcionários"})
		return
	}
	c.JSON(http.StatusOK, funcs)
}

func CreateFunc_C(c *gin.Context) {
	var novoFunc Funcionario
	if err := c.ShouldBindJSON(&novoFunc); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if !ValidarNome(novoFunc.Nome) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nome inválido"})
		return
	}
	if !ValidarCargo(novoFunc.Cargo) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cargo inválido"})
		return
	}
	if !ValidarCPF(novoFunc.Cpf) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CPF inválido"})
		return
	}
	novoFunc.Cpf = PadronizarCPF(novoFunc.Cpf)

	if !ValidarIdade(novoFunc.Idade) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Idade inválida"})
		return
	}

	if _, err := GetFuncByCPF(novoFunc.Cpf); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "CPF já cadastrado"})
		return
	}

	if err := CreateFunc(&novoFunc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar funcionário"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Funcionário criado com sucesso",
		"funcionario": novoFunc,
	})
}

func GetFuncByID_C(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	funcEncontrado, err := GetFuncByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Funcionário não encontrado"})
		return
	}

	c.JSON(http.StatusOK, funcEncontrado)
}

func UpdateFunc_C(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}
	log.Printf("[PUT] Iniciando update id=%s", id)

	funcDB, err := GetFuncByID(id)
	if err != nil {
		log.Printf("[PUT] ID %s não encontrado: %v", id, err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Funcionário não encontrado"})
		return
	}

	var body struct {
		Nome  string `json:"nome"`
		Cargo string `json:"cargo"`
		Idade int    `json:"idade"`
		Cpf   string `json:"cpf"` // ignorado na atualização
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		log.Printf("[PUT] Erro bind JSON id=%s: %v", id, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if !ValidarNome(body.Nome) || !ValidarCargo(body.Cargo) || !ValidarIdade(body.Idade) {
		log.Printf("[PUT] Validação falhou id=%s nome=%q cargo=%q idade=%d", id, body.Nome, body.Cargo, body.Idade)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Campos inválidos"})
		return
	}

	funcDB.Nome = body.Nome
	funcDB.Cargo = body.Cargo
	funcDB.Idade = body.Idade

	if err := UpdateFunc(funcDB); err != nil {
		log.Printf("[PUT] Erro ao salvar id=%s: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar funcionário"})
		return
	}

	log.Printf("[PUT] Sucesso id=%s", id)
	c.JSON(http.StatusOK, gin.H{
		"message":     "Funcionário atualizado com sucesso",
		"funcionario": funcDB,
	})
}

func DeleteFunc_C(c *gin.Context) {
	id := strings.TrimSpace(c.Param("id"))
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := DeleteFunc(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar funcionário"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Funcionário deletado com sucesso"})
}
