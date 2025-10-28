import React, { useState, useEffect } from 'react';

// Colocamos a URL da API fora do componente, pois ela é uma constante
const API_URL = "http://localhost:5001/carros";

// --- Componente Principal da Aplicação ---
function App() {
  // --- ESTADO (STATE) ---
  // Guarda a lista de carros que vem da API. Inicia como um array vazio.
  const [carros, setCarros] = useState([]);
  
  // Guarda os dados do formulário em um único objeto.
  const [formData, setFormData] = useState({
    placa: '',
    cor: '',
    marca: '',
    modelo: '',
    ano: '',
    valor: '',
    km: ''
  });

  // --- FUNÇÕES DE API (Adaptadas para React) ---

  // Busca todos os carros e atualiza o estado 'carros'
  const getAllCarros = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setCarros(data); // Atualiza o estado com a lista de carros
    } catch (error) {
      console.error("Erro ao buscar carros:", error);
      alert("Não foi possível carregar a lista de carros.");
    }
  };

  // --- EFEITOS (LIFECYCLE) ---

  // useEffect com array de dependências vazio ([]) roda APENAS UMA VEZ,
  // quando o componente é montado. Perfeito para buscar os dados iniciais.
  useEffect(() => {
    getAllCarros();
  }, []);

  // --- MANIPULADORES DE EVENTOS (EVENT HANDLERS) ---

  // Função genérica para atualizar o estado do formulário a cada digitação
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Limpa os campos do formulário
  const clearForm = () => {
    setFormData({
      placa: '', cor: '', marca: '', modelo: '', ano: '', valor: '', km: ''
    });
  };

  // Handler para CADASTRAR um carro (submit do formulário)
  const handleCreateCarro = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...formData,
            ano: parseInt(formData.ano),
            km: parseFloat(formData.km),
            valor: parseFloat(formData.valor)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao criar carro");
      
      alert(data.message || "Carro criado com sucesso!");
      getAllCarros(); // Atualiza a lista na tela
      clearForm();    // Limpa os inputs
    } catch (error) {
      alert(error.message);
    }
  };
  
  // Handler para BUSCAR um carro
  const handleGetCarroByPlaca = async () => {
    if (!formData.placa) {
        alert("Por favor, digite uma placa para buscar.");
        return;
    }
    try {
        const response = await fetch(`${API_URL}/${formData.placa}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Carro não encontrado");
        
        // Preenche o formulário com os dados encontrados
        setFormData(data.carro || data);
    } catch(error) {
        alert(error.message);
        clearForm();
    }
  };
  
  // Handler para ATUALIZAR um carro
  const handleUpdateCarro = async () => {
    if (!formData.placa) {
        alert("Por favor, busque um carro pela placa antes de atualizar.");
        return;
    }
    try {
        const response = await fetch(`${API_URL}/${formData.placa}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...formData,
              ano: parseInt(formData.ano),
              km: parseFloat(formData.km),
              valor: parseFloat(formData.valor)
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao atualizar carro");

        alert(data.message || "Carro atualizado com sucesso!");
        getAllCarros();
        clearForm();
    } catch(error) {
        alert(error.message);
    }
  };

  // Handler para DELETAR um carro
  const handleDeleteCarro = async () => {
    if (!formData.placa) {
        alert("Por favor, digite a placa do carro que deseja deletar.");
        return;
    }
    // Confirmação para segurança
    if (!window.confirm(`Tem certeza que deseja deletar o carro com placa ${formData.placa}?`)) {
        return;
    }
    try {
        const response = await fetch(`${API_URL}/${formData.placa}`, { method: 'DELETE' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao deletar carro");

        alert(data.message || "Carro deletado com sucesso!");
        getAllCarros();
        clearForm();
    } catch(error) {
        alert(error.message);
    }
  };

  // --- RENDERIZAÇÃO (JSX) ---
  // O HTML que será exibido na tela.
  const inputStyles = "w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition";
  const buttonStyles = "w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors duration-200";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center font-sans">
      {/* Header aqui (pode ser o componente que criamos antes) */}
      
      <main className="flex flex-col items-center w-full max-w-3xl p-6 md:p-8">
        <h1 className="text-4xl font-bold text-red-600 my-8">
          Bem-vindo à Concessionária
        </h1>

        <div className="w-full flex flex-col gap-8">
          {/* Formulário */}
          <div className="bg-white p-8 rounded-xl shadow-lg w-full">
            <form onSubmit={handleCreateCarro} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <input type="text" name="placa" placeholder="Placa" value={formData.placa} onChange={handleInputChange} className={inputStyles} />
              <input type="text" name="cor" placeholder="Cor" value={formData.cor} onChange={handleInputChange} className={inputStyles} />
              <input type="text" name="marca" placeholder="Marca" value={formData.marca} onChange={handleInputChange} className={inputStyles} />
              <input type="text" name="modelo" placeholder="Modelo" value={formData.modelo} onChange={handleInputChange} className={inputStyles} />
              <input type="number" name="ano" placeholder="Ano" value={formData.ano} onChange={handleInputChange} className={inputStyles} />
              <input type="number" name="valor" placeholder="Valor" value={formData.valor} onChange={handleInputChange} className={inputStyles} />
              <div className="md:col-span-2">
                <input type="number" name="km" placeholder="Km" value={formData.km} onChange={handleInputChange} className={inputStyles} />
              </div>
            </form>
          </div>

          {/* Botões de Ação */}
          <div className="bg-white p-8 rounded-xl shadow-lg w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* O botão de cadastrar agora está dentro do form, mas podemos ter um aqui também */}
              <button type="submit" form="car-form" onClick={handleCreateCarro} className={buttonStyles}>Cadastrar</button>
              <button onClick={handleGetCarroByPlaca} className={buttonStyles}>Buscar</button>
              <button onClick={handleUpdateCarro} className={buttonStyles}>Atualizar</button>
              <button onClick={handleDeleteCarro} className={buttonStyles}>Deletar</button>
            </div>
          </div>
        </div>

        {/* Lista de Carros */}
        <div className="w-full mt-12">
            <h2 className="text-2xl font-bold text-gray-700 text-center mb-4">
              Lista de Carros
            </h2>
            <ul className="bg-white p-6 rounded-xl shadow-lg space-y-3">
              {carros.length > 0 ? (
                carros.map(carro => (
                  <li key={carro.placa} className="p-3 border-b border-gray-200 text-gray-700">
                    <strong>{carro.marca} {carro.modelo}</strong> (Placa: {carro.placa}) - Cor: {carro.cor}, Ano: {carro.ano}, Km: {carro.km}, Valor: R${carro.valor?.toFixed(2)}
                  </li>
                ))
              ) : (
                <p className="text-center text-gray-500">Nenhum carro cadastrado.</p>
              )}
            </ul>
        </div>
      </main>
    </div>
  );
}

export default App;