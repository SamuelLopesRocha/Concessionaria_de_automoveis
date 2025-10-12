const API_URL = "http://localhost:5001/compras";
const form = document.getElementById("compraForm");
const tableBody = document.getElementById("comprasTableBody");
const cancelEditBtn = document.getElementById("cancelEdit");
let editId = null;

// Buscar todas as compras
async function carregarCompras() {
  const res = await fetch(API_URL + "/");
  const data = await res.json();
  tableBody.innerHTML = "";

  if (Array.isArray(data)) {
    data.forEach(c => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${c.id}</td>
        <td>${c.fornecedor}</td>
        <td>${c.placa}</td>
        <td>R$ ${c.valor_compra}</td>
        <td>
          <button class="action-btn edit" onclick="editarCompra(${c.id})">Editar</button>
          <button class="action-btn delete" onclick="deletarCompra(${c.id})">Excluir</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }
}

// Criar ou atualizar compra
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(form).entries());
  formData.valor_compra = parseFloat(formData.valor_compra);
  formData.debito = parseFloat(formData.debito || 0);
  formData.valor_parcela = parseFloat(formData.valor_parcela || 0);
  formData.parcelas = parseInt(formData.parcelas || 1);
  formData.km = parseFloat(formData.km);

  try {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API_URL}/${editId}` : `${API_URL}/`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao salvar");
      return;
    }

    alert(data.message || "Operação realizada com sucesso!");
    form.reset();
    editId = null;
    document.getElementById("formTitle").textContent = "Cadastrar Compra";
    cancelEditBtn.classList.add("hidden");
    carregarCompras();
  } catch (err) {
    alert("Erro de comunicação com o servidor");
  }
});

// Editar
async function editarCompra(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const compra = await res.json();

  for (let key in compra) {
    if (form[key]) form[key].value = compra[key];
  }

  editId = id;
  document.getElementById("formTitle").textContent = "Editar Compra";
  cancelEditBtn.classList.remove("hidden");
}

// Cancelar edição
cancelEditBtn.addEventListener("click", () => {
  form.reset();
  editId = null;
  document.getElementById("formTitle").textContent = "Cadastrar Compra";
  cancelEditBtn.classList.add("hidden");
});

// Deletar
async function deletarCompra(id) {
  if (!confirm("Deseja excluir esta compra?")) return;
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  const data = await res.json();
  alert(data.message || "Registro deletado");
  carregarCompras();
}

carregarCompras();
