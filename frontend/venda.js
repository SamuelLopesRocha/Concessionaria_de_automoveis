const API_URL = 'http://localhost:5001/vendas'
const form = document.getElementById('vendaForm')
const tableBody = document.getElementById('vendasTableBody')
const cancelEditBtn = document.getElementById('cancelEdit')
let editId = null

async function carregarVendas() {
  const res = await fetch(API_URL + '/')
  const data = await res.json()
  tableBody.innerHTML = ''

  if (Array.isArray(data)) {
    data.forEach(c => {
      const row = document.createElement('tr')

      const nomeCarro = c.Carro ? `${c.Carro.marca} ${c.Carro.modelo}` : 'N/A'
      const nomeFuncionario = c.Funcionario ? c.Funcionario.nome : 'N/A'

      row.innerHTML = `
        <td>${c.id_venda}</td>
        <td>${c.data_venda}</td>
        <td>${nomeCarro}</td>
        <td>${nomeFuncionario}</td>
        <td>R$ ${c.valor_total}</td>
        <td>
          <button class="action-btn edit" onclick="editarCompra(${c.id_venda})">Editar</button>
          <button class="action-btn delete" onclick="deletarCompra(${c.id_venda})">Excluir</button>
        </td>
      `
      tableBody.appendChild(row)

      const searchBtn2 = document.getElementById('btnSearch')
      const resetBtn2 = document.getElementById('btnReset')
      const searchInput2 = document.getElementById('searchId')
      searchBtn2.addEventListener('click', async () => {
        const id = searchInput2.value.trim()
        if (!id) {
          alert('Digite um ID para pesquisar.')
          return
        }
        try {
          const res = await fetch(`${API_URL}/${id}`)
          if (!res.ok) {
            alert('Compra não encontrada!')
            return
          }
          const c = await res.json()
          tableBody.innerHTML = `
                <tr>
                  <td>${c.id_venda}</td>
                  <td>${c.data_venda}</td>
                  <td>${nomeCarro}</td>
                  <td>${nomeFuncionario}</td>
                  <td>R$ ${c.valor_total}</td>
                  <td>
                    <button class="action-btn edit" onclick="editarCompra(${c.id_venda})">Editar</button>
                    <button class="action-btn delete" onclick="deletarCompra(${c.id_venda})">Excluir</button>
                  </td>
                </tr>`
        } catch (err) {
          alert('Erro ao buscar compra.')
        }
      })

      resetBtn2.addEventListener('click', () => {
        searchInput.value = ''
        carregarVendas()
      })
    })
  }
}

const inputVenda = document.getElementById('valor_venda')
const inputDesconto = document.getElementById('desconto')
const inputJuros = document.getElementById('juros')
const outputFinal = document.getElementById('valor_total')
const outputComissao = document.getElementById('comissao_vendedor')

function calcularTotal() {
  const venda = parseFloat(inputVenda.value) || 0
  const desconto = parseFloat(inputDesconto.value) || 0
  const juros = parseFloat(inputJuros.value) || 0
  const final = venda * (1 - desconto * 0.01) * (1 + juros * 0.01)
  const comissao = final * 0.01

  outputFinal.value = final.toFixed(2)
  outputComissao.value = comissao.toFixed(2)
}

// Adiciona o listener nos DOIS campos
inputVenda.addEventListener('input', calcularTotal)
inputDesconto.addEventListener('input', calcularTotal)
inputJuros.addEventListener('input', calcularTotal)

form.addEventListener('submit', async e => {
  e.preventDefault()

  // Captura todos os dados do formulário
  const formData = Object.fromEntries(new FormData(form).entries())

  // Converte campos numéricos com segurança
  formData.valor_venda = parseFloat(formData.valor_venda || 0)
  formData.debito = parseFloat(formData.debito || 0)
  formData.valor_parcela = parseFloat(formData.valor_parcela || 0)
  formData.parcelas = parseInt(formData.parcelas || 1)
  formData.desconto = parseFloat(formData.desconto || 0)
  formData.juros = parseFloat(formData.juros || 0)
  formData.valor_total = parseFloat(formData.valor_total || 0)
  formData.comissao_vendedor = parseFloat(formData.comissao_vendedor || 0)
  formData.id_funcionario = parseInt(formData.id_funcionario) || 0

  console.log('📤 Enviando payload:', formData)

  try {
    const method = editId ? 'PUT' : 'POST'
    const url = editId ? `${API_URL}/${editId}` : `${API_URL}/`

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await res.json()

    console.log('📥 Resposta da API:', data)

    if (!res.ok) {
      alert(data.error || `Erro ao salvar (HTTP ${res.status})`)
      return
    }

    alert(data.message || 'Operação realizada com sucesso!')
    form.reset()
    editId = null
    document.getElementById('formTitle').textContent = 'Cadastrar Venda'
    cancelEditBtn.classList.add('hidden')
    carregarVendas()
  } catch (err) {
    console.error('❌ Erro de comunicação:', err)
    alert('Erro de comunicação com o servidor')
  }
})

async function editarCompra(id) {
  const res = await fetch(`${API_URL}/${id}`)
  const compra = await res.json()

  for (let key in compra) {
    if (form[key]) form[key].value = compra[key]
  }

  editId = id
  document.getElementById('formTitle').textContent = 'Editar Venda'
  cancelEditBtn.classList.remove('hidden')
}

cancelEditBtn.addEventListener('click', () => {
  form.reset()
  editId = null
  document.getElementById('formTitle').textContent = 'Cadastrar Venda'
  cancelEditBtn.classList.add('hidden')
})

async function deletarCompra(id) {
  if (!confirm('Deseja excluir esta compra?')) return
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
  const data = await res.json()
  alert(data.message || 'Registro deletado')
  carregarVendas()
}

carregarVendas()
