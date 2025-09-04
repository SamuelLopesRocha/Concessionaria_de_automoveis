const API_URL = "http://localhost:5001/carros";

// ===== FUNÇÕES DA API =====

// Listar todos os carros e atualizar a <ul>
async function getAllCarros() {
    const response = await fetch(API_URL);
    const carros = await response.json();

    const ul = document.getElementById("carros-list");
    ul.innerHTML = "";

    carros.forEach(carro => {
        const li = document.createElement("li");
        li.textContent = `${carro.marca} ${carro.modelo} - Placa: ${carro.placa} - Cor: ${carro.cor} - Ano: ${carro.ano} - Km: ${carro.km} - Valor: R$${carro.valor.toFixed(2)}`;
        ul.appendChild(li);
    });

    return carros;
}

// Criar um novo carro
async function createCarro(carro) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carro)
    });
    
    const data = await response.json();

    if (!response.ok) {
        alert(data.error || "Erro ao criar carro");
        return;
    }

    alert(data.message || "Carro criado com sucesso");
    return data;
}

// Buscar carro por placa
async function getCarroByPlaca(placa) {
    const response = await fetch(`${API_URL}/${placa}`);
    const data = await response.json();

    if (!response.ok) {
        alert(data.error || "Carro não encontrado");
        return null;
    }
    return data.carro || data;
}

// Atualizar carro por placa
async function updateCarro(placa, updatedCarro) {
    const response = await fetch(`${API_URL}/${placa}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCarro)
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.error || "Erro ao atualizar carro");
        return;
    }

    alert(data.message || "Carro atualizado com sucesso");
    return data;
}

// Deletar carro por placa
async function deleteCarro(placa) {
    const response = await fetch(`${API_URL}/${placa}`, {
        method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.error || "Erro ao deletar carro");
        return;
    }

    alert(data.message || "Carro deletado com sucesso");
}

// ===== FUNÇÕES AUXILIARES =====

function getCarroFromInputs() {
    return {
        marca: document.getElementById("marca").value,
        modelo: document.getElementById("modelo").value,
        placa: document.getElementById("placa").value,
        cor: document.getElementById("cor").value,
        ano: parseInt(document.getElementById("ano").value),
        km: parseFloat(document.getElementById("km").value),
        valor: parseFloat(document.getElementById("valor").value)
    };
}

function fillInputs(carro) {
    document.getElementById("marca").value = carro.marca || "";
    document.getElementById("modelo").value = carro.modelo || "";
    document.getElementById("placa").value = carro.placa || "";
    document.getElementById("cor").value = carro.cor || "";
    document.getElementById("ano").value = carro.ano || "";
    document.getElementById("km").value = carro.km || "";
    document.getElementById("valor").value = carro.valor || "";
}

// ===== EVENTOS DOS BOTÕES =====

document.getElementById("form-carro").addEventListener("submit", async (e) => {
    e.preventDefault();
    const carro = getCarroFromInputs();
    await createCarro(carro);
    await getAllCarros();
});

document.getElementById("btn-buscar").addEventListener("click", async () => {
    const placa = document.getElementById("placa").value;
    const carro = await getCarroByPlaca(placa);
    if (carro) fillInputs(carro);
});

document.getElementById("btn-atualizar").addEventListener("click", async () => {
    const placa = document.getElementById("placa").value;
    const carroAtualizado = getCarroFromInputs();
    await updateCarro(placa, carroAtualizado);
    await getAllCarros();
});

document.getElementById("btn-deletar").addEventListener("click", async () => {
    const placa = document.getElementById("placa").value;
    await deleteCarro(placa);
    await getAllCarros();
});

document.addEventListener("DOMContentLoaded", () => {
    getAllCarros();
});

// ===== MENU DROPDOWN MODERNO =====

document.getElementById("logo-btn").addEventListener("click", function(e) {
    e.stopPropagation();
    const menu = document.getElementById("menu-dropdown");
    menu.classList.toggle("show");
});

// Fecha o menu se clicar fora dele
document.addEventListener("click", function(e) {
    const menu = document.getElementById("menu-dropdown");
    const logo = document.getElementById("logo-btn");
    if (!menu.contains(e.target) && e.target !== logo) {
        menu.classList.remove("show");
    }
});