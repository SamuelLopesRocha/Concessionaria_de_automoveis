package funcionario

import (
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)


// Valida o nome (obrigatório e apenas string)
func ValidarNome(nome string) bool {
	nome = strings.TrimSpace(nome)
	if len(nome) == 0 {
		return false // obrigatório
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ\s]+$`)
	return re.MatchString(nome)
}

// Valida o cargo (obrigatório e apenas string)
func ValidarCargo(cargo string) bool {
	cargo = strings.TrimSpace(cargo)
	if len(cargo) == 0 {
		return false // obrigatório
	}
	re := regexp.MustCompile(`^[A-Za-zÀ-ÿ\s]+$`)
	return re.MatchString(cargo)
}


// Padroniza CPF (remove pontos e traços)
func PadronizarCPF(cpf string) string {
    cpf = strings.TrimSpace(cpf)
    cpf = strings.ReplaceAll(cpf, ".", "")
    cpf = strings.ReplaceAll(cpf, "-", "")
    return cpf
}

// Valida CPF (obrigatório, deve ter 11 dígitos após padronização)
func ValidarCPF(cpf string) bool {
    cpf = PadronizarCPF(cpf)
    if len(cpf) == 0 {
        return false // obrigatório
    }
    re := regexp.MustCompile(`^[0-9]{11}$`)
    return re.MatchString(cpf)
}

// Valida idade
func ValidarIdade(idade int) bool {
    return idade > 0
}


func GetFuncs(c *gin.Context) {
	funcs, err := GetAllFuncs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar os funcionarios"})
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

	// Validação do nome
	if !ValidarNome(novoFunc.Nome) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nome inválido. Use apenas letras e espaços"})
		return
	}

	// Validação do cargo
	if !ValidarCargo(novoFunc.Cargo) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cargo inválido. Use apenas letras e espaços"})
		return
	}

	// Validação do CPF
    if !ValidarCPF(novoFunc.Cpf) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "CPF inválido. Digite apenas números ou no formato 000.000.000-00"})
        return
    }
    novoFunc.Cpf = PadronizarCPF(novoFunc.Cpf) 

	 // Validação da idade
    if !ValidarIdade(novoFunc.Idade) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Idade inválida. Deve ser um número maior que zero"})
        return
    }

	// Função de criar no banco
	if err := CreateFunc(&novoFunc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar o funcionário"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Funcionário criado com sucesso"})
}

func GetFuncByID_C(c *gin.Context) {
	id := c.Param("id")

	
	if strings.TrimSpace(id) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}


	funcEncontrado, err := GetFuncByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Funcionario não encontrado"})
		return
	}

	c.JSON(http.StatusOK, funcEncontrado)
}

// Atualizar funcionário
func UpdateFunc_C(c *gin.Context) {
	id := c.Param("id")

	// Busca o funcionário no banco
	funcionarioEncontrado, err := GetFuncByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Funcionário não encontrado"})
		return
	}

	// Faz o bind dos novos dados para o objeto existente
	if err := c.ShouldBindJSON(&funcionarioEncontrado); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	// Garante que o ID não seja alterado
	funcionarioEncontrado.Id = funcionarioEncontrado.Id

	// Validação do nome
	if !ValidarNome(funcionarioEncontrado.Nome) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nome inválido. Use apenas letras e espaços"})
		return
	}

	// Validação do cargo
	if !ValidarCargo(funcionarioEncontrado.Cargo) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cargo inválido. Use apenas letras e espaços"})
		return
	}

	// Validação do CPF
	if !ValidarCPF(funcionarioEncontrado.Cpf) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "CPF inválido. Digite apenas números ou no formato 000.000.000-00"})
		return
	}
	funcionarioEncontrado.Cpf = PadronizarCPF(funcionarioEncontrado.Cpf) // salva sem pontuação

	// Validação da idade
	if !ValidarIdade(funcionarioEncontrado.Idade) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Idade inválida. Deve ser um número maior que zero"})
		return
	}

	// Atualiza no banco
	if err := UpdateFunc(funcionarioEncontrado); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar o funcionário"})
		return
	}

	c.JSON(http.StatusOK, funcionarioEncontrado)
}


// Deletar funcionário
func DeleteFunc_C(c *gin.Context) {
	id := c.Param("id")

	// Validação simples do ID (não pode ser vazio)
	if strings.TrimSpace(id) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// Excluir funcionário no banco
	if err := DeleteFunc(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar o funcionário"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Funcionário deletado com sucesso"})
}
