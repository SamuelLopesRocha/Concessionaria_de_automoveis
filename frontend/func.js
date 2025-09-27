const API_FUNC_URL = "http://localhost:5001/funcionarios";

// ================= Utilidades =================
const qs = sel => document.querySelector(sel);
const normalizarCPF = cpf => cpf.replace(/\D/g, "");
const parseId = val => {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? null : n;
};

const MSG = {
  created: 'Funcionário criado com sucesso',
  updated: 'Funcionário atualizado com sucesso',
  deleted: 'Funcionário deletado com sucesso',
  none: 'Nenhum funcionário cadastrado'
};

// ================= Helpers =================
function getFormData(includeCPF = true) {
  return {
    nome: qs('#nome').value.trim(),
    cargo: qs('#cargo').value.trim(),
    idade: parseInt(qs('#idade').value, 10),
    ...(includeCPF ? { cpf: normalizarCPF(qs('#cpf').value.trim()) } : {})
  };
}

function fillForm(f) {
  qs('#nome').value = f?.nome || '';
  qs('#cargo').value = f?.cargo || '';
  qs('#idade').value = f?.idade ?? '';
  qs('#cpf').value = f?.cpf || '';
  qs('#id-func').value = f?.id ?? '';
}

function clearForm() {
  qs('#form-func').reset();
  qs('#id-func').value = '';
}

async function apiRequest(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const isJson = res.headers.get("content-type")?.includes("application/json");
    const body = isJson ? await res.json().catch(() => null) : null;
    if (!res.ok) throw new Error(body?.error || body?.message || `Erro HTTP ${res.status}`);
    return body;
  } catch (e) {
    alert(e.message || "Erro de conexão");
    throw e;
  }
}

function renderLista(funcs) {
  const ul = qs('#func-list');
  ul.innerHTML = "";
  if (!funcs?.length) {
    ul.innerHTML = `<li style="font-style:italic;color:#666">${MSG.none}</li>`;
    return;
  }
  funcs.forEach(f => {
    const li = document.createElement("li");
    li.textContent = `${f.id} | ${f.nome} | Cargo: ${f.cargo} | Idade: ${f.idade} | CPF: ${f.cpf}`;
    li.style.cursor = "pointer";
    li.onclick = () => fillForm(f);
    ul.appendChild(li);
  });
}

// ================= CRUD =================
async function getAllFuncionarios() {
  const data = await apiRequest(API_FUNC_URL).catch(() => null);
  if (data) renderLista(Array.isArray(data) ? data : []);
}

async function createFuncionario() {
  const d = getFormData(true);
  if (!d.nome || !d.cargo || Number.isNaN(d.idade) || !d.cpf) return alert("Preencha todos os campos");
  if (d.cpf.length !== 11) return alert("CPF deve ter 11 dígitos");
  const body = await apiRequest(API_FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d)
  }).catch(() => null);
  if (body) {
    alert(body.message || MSG.created);
    fillForm(body.funcionario || body);
    getAllFuncionarios();
  }
}

async function buscarFuncionario() {
  const id = parseId(qs('#id-func').value);
  if (!id) return alert("Informe ID");
  const body = await apiRequest(`${API_FUNC_URL}/${id}`).catch(() => null);
  if (body) fillForm(body);
}

async function updateFuncionario() {
  const id = parseId(qs('#id-func').value);
  if (!id) return alert("Informe ID");
  const d = getFormData(false);
  if (!d.nome || !d.cargo || Number.isNaN(d.idade)) return alert("Campos inválidos");
  const body = await apiRequest(`${API_FUNC_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d)
  }).catch(() => null);
  if (body) {
    alert(body.message || MSG.updated);
    fillForm(body.funcionario || body);
    getAllFuncionarios();
  }
}

async function deleteFuncionario() {
  const id = parseId(qs('#id-func').value);
  if (!id) return alert("Informe ID");
  if (!confirm("Confirmar exclusão?")) return;
  const body = await apiRequest(`${API_FUNC_URL}/${id}`, { method: "DELETE" }).catch(() => null);
  if (body) {
    alert(body.message || MSG.deleted);
    clearForm();
    getAllFuncionarios();
  }
}

// ================= Eventos =================
qs('#form-func').addEventListener('submit', e => { e.preventDefault(); createFuncionario(); });
qs('#btn-buscar').addEventListener('click', buscarFuncionario);
qs('#btn-atualizar').addEventListener('click', updateFuncionario);
qs('#btn-deletar').addEventListener('click', deleteFuncionario);
document.addEventListener('DOMContentLoaded', getAllFuncionarios);
