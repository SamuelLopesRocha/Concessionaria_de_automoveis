package route

import (
	"Concessionaria/carro" // Importa o controller correto
	"Concessionaria/config"
    "Concessionaria/carro"
	"github.com/gin-gonic/gin"
)

func CarroRoutes(router *gin.Engine) {
	carroGroup := router.Group("/carros")
	{
		carroGroup.GET("/", controller.GetCarros)
		carroGroup.POST("/", controller.CreateCarro)
		carroGroup.GET("/:id", controller.GetCarroByID)
		carroGroup.PUT("/:id", controller.UpdateCarro)
		carroGroup.DELETE("/:id", controller.DeleteCarro)
	}
}

// Buscar todos os carros
func GetAllCarros() ([]models.Carro, error) {
	var carros []models.Carro
	result := config.DB.Find(&carros)
    return carros, result.Error
}

// Criar novo carro
func CreateCarro(carro *models.Carro) error {
    result := config.DB.Create(carro)
    return result.Error
}

// Buscar carro por ID
func GetCarroByID(id uint) (*models.Carro, error) {
    var carro models.Carro
    result := config.DB.First(&carro, id)
    if result.Error != nil {
        return nil, result.Error
    }
    return &carro, nil
}

// Atualizar carro
func UpdateCarro(carro *models.Carro) error {
    result := config.DB.Save(carro)
    return result.Error
}

// Deletar carro
func DeleteCarro(id uint) error {
    result := config.DB.Delete(&models.Carro{}, id)
    return result.Error
}