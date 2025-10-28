const API_URL = "http://localhost:5001/vendas";
const form = document.getElementById("vendaForm");
const tableBody = document.getElementById("vendasTableBody");
const cancelEditBtn = document.getElementById("cancelEdit");
let editId = null;

async function carregarVendas() {
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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Captura todos os dados do formulário
  const formData = Object.fromEntries(new FormData(form).entries());



  // Converte campos numéricos com segurança
  formData.valor_venda = parseFloat(formData.valor_venda || 0);
  formData.debito = parseFloat(formData.debito || 0);
  formData.valor_parcela = parseFloat(formData.valor_parcela || 0);
  formData.parcelas = parseInt(formData.parcelas || 1);
  formData.desconto = parseFloat(formData.desconto || 0);
  formData.juros = parseInt(formData.juros || 0);
  formData.valor_total = parseFloat(formData.valor_total || 0);
  formData.comissao_vendedor = parseInt(formData.comissao_vendedor || 0);

  console.log("📤 Enviando payload:", formData);

  try {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API_URL}/${editId}` : `${API_URL}/`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    console.log("📥 Resposta da API:", data);

    if (!res.ok) {
      alert(data.error || `Erro ao salvar (HTTP ${res.status})`);
      return;
    }

    alert(data.message || "Operação realizada com sucesso!");
    form.reset();
    editId = null;
    document.getElementById("formTitle").textContent = "Cadastrar Venda";
    cancelEditBtn.classList.add("hidden");
    carregarVendas();
  } catch (err) {
    console.error("❌ Erro de comunicação:", err);
    alert("Erro de comunicação com o servidor");
  }
});

carregarVendas();