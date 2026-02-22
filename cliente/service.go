package cliente

import "github.com/SamuelLopesRocha/Concessionaria_de_automoveis/config"

func GetClientesComVenda() ([]Cliente, error) {

	var clientes []Cliente

	err := config.DB.
		Model(&Cliente{}).
		Joins("INNER JOIN vendas ON vendas.cliente_id = clientes.id").
		Group("clientes.id").
		Find(&clientes).Error

	if err != nil {
		return nil, err
	}

	return clientes, nil
}
