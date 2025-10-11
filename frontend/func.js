// Detecta backend: se estiver em localhost/127.* usa porta 5001 fixa; caso contrário permite configurar.
const API_HOST = (location.hostname === 'localhost' || location.hostname.startsWith('127.')) ? 'http://'+location.hostname+':5001' : 'http://localhost:5001';
const API_FUNC_URL = `${API_HOST}/funcionarios`;

// ================= Utilidades =================
const qs = sel => document.querySelector(sel);
const normalizarCPF = cpf => cpf.replace(/\D/g, "");
const formatarCPF = cpf => {
  const numeros = normalizarCPF(cpf);
  if (numeros.length !== 11) return cpf; // retorna original se não tiver 11 dígitos
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};
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
  qs('#cpf').value = f?.cpf ? formatarCPF(f.cpf) : '';
  qs('#id-func').value = f?.id ?? '';
}

function clearForm() {
  qs('#form-func').reset();
  qs('#id-func').value = '';
}

async function apiRequest(url, options = {}) {
  const method = options.method || 'GET';
  const maxRetries = 1; // total de novas tentativas além da primeira
  const timeoutMs = 1500; // tempo máximo por tentativa

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const startedAt = performance.now();
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), timeoutMs);
    console.debug('[API] →', method, url, 'tentativa', attempt+1, options.body || '');
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(to);
      const dur = (performance.now() - startedAt).toFixed(1) + 'ms';
      const ct = res.headers.get('content-type') || '';
      const isJson = ct.includes('application/json');
      let body = null;
      if (isJson) {
        try { body = await res.json(); } catch (parseErr) { console.warn('[API] Falha ao parsear JSON', parseErr); }
      }
      if (!res.ok) {
        const msg = body?.error || body?.message || `Erro HTTP ${res.status}`;
        console.warn('[API] ✗', method, url, 'status:', res.status, 'tempo:', dur, 'msg:', msg, 'tentativa', attempt+1);
        if (attempt < maxRetries && (res.status >= 500 || res.status === 0)) {
          console.warn('[API] retry agendado...');
          continue;
        }
        alert(msg);
        return null;
      }
      console.debug('[API] ✓', method, url, 'status:', res.status, 'tempo:', dur, 'tentativa', attempt+1, body);
      // Garante sempre objeto para facilitar tratamento posterior
      return body ?? {};
    } catch (e) {
      clearTimeout(to);
      const dur = (performance.now() - startedAt).toFixed(1) + 'ms';
      const raw = (e && e.message) ? e.message : String(e);
      const aborted = raw.includes('AbortError');
      const networkHint = raw.includes('Failed to fetch') || aborted ? 'Possível: servidor OFF, CORS bloqueado, porta errada ou timeout' : '';
      console.error('[API] NETWORK FAIL', method, url, 'tempo:', dur, 'erro:', raw, 'tentativa', attempt+1);
      if (attempt < maxRetries) {
        console.warn('[API] nova tentativa...');
        continue;
      }
      alert(networkHint ? (raw + '\n' + networkHint) : raw);
      return null;
    }
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
    li.textContent = `${f.id} | ${f.nome} | Cargo: ${f.cargo} | Idade: ${f.idade} | CPF: ${formatarCPF(f.cpf)}`;
    li.style.cursor = "pointer";
    li.onclick = () => fillForm(f);
    ul.appendChild(li);
  });
}

// ================= CRUD =================
async function getAllFuncionarios() {
  const data = await apiRequest(API_FUNC_URL);
  if (data) renderLista(Array.isArray(data) ? data : []);
}

async function createFuncionario() {
  const d = getFormData(true);
  if (!d.nome || !d.cargo || Number.isNaN(d.idade) || !d.cpf) {
    return alert("Preencha todos os campos");
  }
  if (d.cpf.length !== 11) {
    return alert("CPF deve ter 11 dígitos");
  }

  const body = await apiRequest(API_FUNC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d)
  });
  if (body !== null) {
    alert((body && body.message) || MSG.created);
    if (body && (body.funcionario || body.id)) {
      fillForm(body.funcionario || body);
    }
    getAllFuncionarios();
  }
}

async function buscarFuncionario() {
  const id = parseId(qs('#id-func').value);
  if (!id) return alert("Informe ID");

  const body = await apiRequest(`${API_FUNC_URL}/${id}`);
  if (body) fillForm(body);
}

async function updateFuncionario() {
  const id = parseId(qs('#id-func').value);
  if (!id) return alert("Informe ID");

  const d = getFormData(false);
  if (!d.nome || !d.cargo || Number.isNaN(d.idade)) {
    return alert("Campos inválidos");
  }

  const body = await apiRequest(`${API_FUNC_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d)
  });

  if (body !== null) {
    alert(body.message || MSG.updated);
    if (body.funcionario) fillForm(body.funcionario);
    getAllFuncionarios();
  }
}

async function deleteFuncionario() {
  const id = parseId(qs('#id-func').value);
  if (!id) return alert("Informe ID");
  if (!confirm("Confirmar exclusão?")) return;

  const body = await apiRequest(`${API_FUNC_URL}/${id}`, { method: "DELETE" });
  if (body !== null) {
    alert(body.message || MSG.deleted);
    clearForm();
    getAllFuncionarios();
  }
}

// ================= Eventos =================
qs('#form-func').addEventListener('submit', e => {
  e.preventDefault();
  createFuncionario();
});
qs('#btn-buscar').addEventListener('click', buscarFuncionario);
qs('#btn-atualizar').addEventListener('click', updateFuncionario);
qs('#btn-deletar').addEventListener('click', deleteFuncionario);
document.addEventListener('DOMContentLoaded', getAllFuncionarios);

// Máscara automática para CPF
qs('#cpf').addEventListener('input', function(e) {
  const valor = e.target.value;
  const apenasNumeros = normalizarCPF(valor);
  
  // Limita a 11 dígitos
  if (apenasNumeros.length <= 11) {
    e.target.value = formatarCPF(apenasNumeros);
  } else {
    e.target.value = formatarCPF(apenasNumeros.slice(0, 11));
  }
});
