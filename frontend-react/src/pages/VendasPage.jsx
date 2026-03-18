import { useEffect, useState } from 'react'
import { api, fmt } from '../lib/api'

export default function VendasPage(){

  const [items,setItems]=useState([])
  const [editingId, setEditingId] = useState(null)

  // Funcionários (select)
  const [funcionarios, setFuncionarios] = useState([])

  // Carros (select)
  const [carros, setCarros] = useState([])
  const [carroInfo, setCarroInfo] = useState(null)

  const [form,setForm]=useState({
    id_carro:'',          // placa (string)
    id_vendedor:'',
    data_venda:'',
    valor_total:'',
    forma_pagamento:'à vista',
    parcelas:'',
    juros:'',
    desconto:'',
    comissao_vendedor:'',
    nome:'',
    cpf:'',
    telefone:'',
    email:''
  })

  const [errors, setErrors] = useState({})

  async function fetchAll(){
    try{
      const {data}=await api.get('/vendas/')
      setItems(Array.isArray(data)?data:[])
    }catch(e){ console.error(e) }
  }

  async function fetchFuncionarios(){
    try{
      const { data } = await api.get('/funcionarios')
      setFuncionarios(Array.isArray(data) ? data : [])
    }catch(e){
      console.error(e)
      setFuncionarios([])
    }
  }

  async function fetchCarros(){
    try{
      const { data } = await api.get('/carros')
      setCarros(Array.isArray(data) ? data : [])
    }catch(e){
      console.error(e)
      setCarros([])
    }
  }

  useEffect(()=>{ 
    fetchAll()
    fetchFuncionarios()
    fetchCarros()
  },[])

  function clear(){
    setEditingId(null)
    setErrors({})
    setCarroInfo(null)
    setForm({
      id_carro:'', id_vendedor:'', data_venda:'', valor_total:'',
      forma_pagamento:'à vista', parcelas:'', juros:'', desconto:'',
      comissao_vendedor:'',
      nome:'', cpf:'', telefone:'', email:''
    })
  }

  function fill(v){
    setEditingId(v.id)

    const placa = String(v.id_carro||'')
    const carroEncontrado = carros.find(c => String(c.placa||'') === placa) || null
    setCarroInfo(carroEncontrado)

    setForm({
      id_carro: placa,
      id_vendedor: String(v.id_funcionario || v.funcionario_id || v.FuncionarioID || ''),
      data_venda: v.data_venda || '',
      valor_total: String(v.valor_venda||''),
      forma_pagamento: v.forma_pgto || 'à vista',
      parcelas: String(v.parcelas||''),
      juros: String(v.juros||''),
      desconto: String(v.desconto||''),
      comissao_vendedor: String(v.comissao_vend||''),
      nome: v.Cliente?.nome || '',
      cpf: v.Cliente?.cpf ? fmt.cpf(v.Cliente.cpf) : '',
      telefone: v.Cliente?.telefone || '',
      email: v.Cliente?.email || ''
    })

    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validate(){
    const e = {}

    if(!form.id_carro.trim()) e.id_carro = true
    if(!form.id_vendedor) e.id_vendedor = true

    if(!form.valor_total || Number(form.valor_total) <= 0) e.valor_total = true
    if(!form.nome.trim()) e.nome = true
    if(fmt.onlyDigits(form.cpf).length !== 11) e.cpf = true
    if(!form.forma_pagamento) e.forma_pagamento = true
    if(form.forma_pagamento === 'parcelado'){
      if(!form.parcelas || Number(form.parcelas) <= 1) e.parcelas = true
    }
    if(form.juros === '') e.juros = true
    if(form.desconto === '') e.desconto = true
    if(form.comissao_vendedor === '') e.comissao_vendedor = true
    if(!form.data_venda) e.data_venda = true
    if(!form.telefone.trim()) e.telefone = true
    if(!form.email.trim()) e.email = true

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function fieldStyle(name){
    if(errors[name]) return {...styles.input, border:'2px solid #ef4444'}
    if(form[name]) return {...styles.input, border:'2px solid #22c55e'}
    return styles.input
  }

  function formatBRL(v){
    const n = Number(v || 0)
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  }

  function onSelectCarro(placa){
    const c = carros.find(x => String(x.placa) === String(placa)) || null
    setCarroInfo(c)

    setForm(f => {
      const next = { ...f, id_carro: placa }
      // autopreenche valor_total se estiver vazio
      if(!next.valor_total && c && c.valor != null){
        next.valor_total = String(Number(c.valor))
      }
      return next
    })

    setErrors(prev => ({...prev, id_carro:false}))
  }

  function getNomeFuncionario(id){
    const f = funcionarios.find(x => String(x.id) === String(id))
    return f?.nome || `(ID ${id})`
  }

  function getResumoCarro(placa){
    const c = carros.find(x => String(x.placa) === String(placa))
    if(!c) return placa
    return `${c.placa} — ${c.marca} ${c.modelo} — R$ ${formatBRL(c.valor)}`
  }

  // ✅ chama o mesmo fluxo do "reenviar"
  async function enviarEmailVerificacaoComoReenviar(clienteId){
    try{
      await api.post(`/clientes/${clienteId}/reenviar-email`)
      return true
    }catch(e){
      console.error(e)
      return false
    }
  }

  async function save(){
    if(!validate()){
      alert('Existem campos obrigatórios inválidos.')
      return
    }

    // ✅ Pergunta de confirmação ANTES de registrar
    if(!editingId){
      const ok = confirm(
        `Confirmar venda?\n\n` +
        `Carro: ${getResumoCarro(form.id_carro)}\n` +
        `Funcionário: ${getNomeFuncionario(form.id_vendedor)}\n` +
        `Cliente: ${form.nome.trim()} (CPF ${fmt.onlyDigits(form.cpf)})\n` +
        `Valor: R$ ${formatBRL(form.valor_total)}\n\n` +
        `Ao confirmar, o sistema vai registrar a venda e enviar o e-mail de verificação.`
      )
      if(!ok) return
    }

    const body = {
      valor_venda: Number(form.valor_total),
      forma_pgto: form.forma_pagamento,
      data_venda: form.data_venda,
      parcelas: Number(form.parcelas || 0),
      juros: Number(form.juros || 0),
      desconto: Number(form.desconto || 0),
      comissao_vend: Number(form.comissao_vendedor || 0),
      nome: form.nome.trim(),
      cpf: fmt.onlyDigits(form.cpf),
      telefone: form.telefone.trim(),
      email: form.email.trim(),

      // carro_id = placa
      id_carro: form.id_carro.trim(),

      // backend espera id_funcionario
      id_funcionario: Number(form.id_vendedor || 0),
    }

    try{
      if(editingId){
        await api.put(`/vendas/${editingId}`, body)
        alert('Venda atualizada')
        clear()
        fetchAll()
        return
      }

      // ✅ cria venda
      const resp = await api.post('/vendas/', body)
      alert('Venda registrada')

      // ✅ depois de registrar, enviar email igual reenviar
      // tenta achar o cliente_id retornado pela API
      const venda = resp?.data
      const clienteId =
        venda?.cliente_id ||
        venda?.ClienteID ||
        venda?.Cliente?.id ||
        venda?.Cliente?.ID

      // Se o backend retornar o status e estiver VERIFICADO, não precisa enviar
      const statusEmail =
        venda?.Cliente?.status_email ||
        venda?.Cliente?.StatusEmail ||
        venda?.status_email ||
        venda?.StatusEmail

      if(clienteId && String(statusEmail).toUpperCase() === 'VERIFICADO'){
        // já verificado, não manda
      } else if(clienteId){
        const enviado = await enviarEmailVerificacaoComoReenviar(clienteId)
        if(!enviado){
          alert('Venda registrada, mas falhou ao enviar o e-mail de verificação. Você pode usar "Reenviar e-mail" no cliente.')
        }
      } else {
        // se não veio clienteId no retorno, avisa (pra você ajustar o backend depois)
        alert('Venda registrada, mas não consegui identificar o ID do cliente para enviar o e-mail automático. Verifique o retorno do endpoint /vendas/.')
      }

      clear()
      fetchAll()
    }
    catch(e){
      alert(e.response?.data?.error || 'Erro ao salvar venda')
    }
  }

  async function remove(id){
    if(!confirm('Deseja excluir esta venda?')) return
    try{
      await api.delete(`/vendas/${id}`)
      alert('Venda excluída')
      fetchAll()
    }catch(e){ alert('Erro ao excluir') }
  }

  const styles = {
    row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'15px' },
    row3: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'15px', marginBottom:'15px' },
    group: { display:'flex', flexDirection:'column', gap:'8px' },
    input: { padding:'12px', borderRadius:'8px', border:'1px solid #374151', backgroundColor:'#111827', color:'white', width:'100%', outline:'none' },
    label: { fontSize:'0.9rem', color:'#9ca3af' },
    listItem: { display:'flex', justifyContent:'space-between', alignItems:'center', backgroundColor:'#111827', border:'1px solid #374151', borderRadius:'8px', padding:'15px', marginBottom:'10px' },
    btnGroup: { display:'flex', gap:'10px' }
  }

  return (
    <div className="grid">

      <section className="card" style={{gridColumn:'span 6', height:'85vh', overflowY:'auto'}}>
        <h2 style={{marginBottom:'20px'}}>{editingId ? 'Editar Venda' : 'Nova Venda'}</h2>

        {/* 1º campo: Carro / 2º: Funcionário */}
        <div style={styles.row}>
          <div style={styles.group}>
            <label style={styles.label}>Carro</label>
            <select
              style={fieldStyle('id_carro')}
              value={form.id_carro}
              onChange={e => onSelectCarro(e.target.value)}
              required
            >
              <option value="">Selecione um carro</option>
              {carros.map(c => (
                <option key={c.placa} value={String(c.placa)}>
                  {String(c.placa)} — {c.marca} {c.modelo} — R$ {formatBRL(c.valor)}
                </option>
              ))}
            </select>

            {carroInfo && (
              <span style={{fontSize:'0.85rem', color:'#9ca3af'}}>
                Selecionado: <strong style={{color:'white'}}>{carroInfo.placa}</strong> • {carroInfo.marca} {carroInfo.modelo} ({carroInfo.ano})
              </span>
            )}
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Funcionário</label>
            <select
              style={fieldStyle('id_vendedor')}
              value={form.id_vendedor}
              onChange={e=>setForm(f=>({...f,id_vendedor:e.target.value}))}
              required
            >
              <option value="">Selecione um funcionário</option>
              {funcionarios.map((f)=>(
                <option key={f.id} value={String(f.id)}>
                  {f.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Valores */}
        <div style={styles.row}>
          <div style={styles.group}>
            <label style={styles.label}>Valor total</label>
            <input type="number" style={fieldStyle('valor_total')}
              value={form.valor_total}
              onChange={e=>setForm(f=>({...f,valor_total:e.target.value}))}/>
          </div>

          <div style={styles.group}>
            <label style={styles.label}>Forma pagamento</label>
            <select
              style={fieldStyle('forma_pagamento')}
              value={form.forma_pagamento}
              onChange={e=>{
                const value = e.target.value
                setForm(f=>({...f, forma_pagamento: value, parcelas: value==='à vista'?1:f.parcelas}))
              }}
            >
              <option value="">Selecione</option>
              <option value="à vista">À vista</option>
              <option value="parcelado">Parcelado</option>
            </select>
          </div>
        </div>

        <div style={styles.row3}>
          <div style={styles.group}>
            <label style={styles.label}>Parcelas</label>
            <input type="number" style={fieldStyle('parcelas')} value={form.parcelas} onChange={e=>setForm(f=>({...f,parcelas:e.target.value}))}/>
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Juros (%)</label>
            <input type="number" style={fieldStyle('juros')} value={form.juros} onChange={e=>setForm(f=>({...f,juros:e.target.value}))}/>
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Desconto</label>
            <input type="number" style={fieldStyle('desconto')} value={form.desconto} onChange={e=>setForm(f=>({...f,desconto:e.target.value}))}/>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.group}>
            <label style={styles.label}>Comissão vendedor</label>
            <input type="number" style={fieldStyle('comissao_vendedor')} value={form.comissao_vendedor} onChange={e=>setForm(f=>({...f,comissao_vendedor:e.target.value}))}/>
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Data</label>
            <input type="date" style={fieldStyle('data_venda')} value={form.data_venda} onChange={e=>setForm(f=>({...f,data_venda:e.target.value}))}/>
          </div>
        </div>

        <h3 style={{marginTop:'25px', marginBottom:'15px'}}>Cliente</h3>
        <div style={styles.row}>
          <div style={styles.group}>
            <label style={styles.label}>Nome</label>
            <input style={fieldStyle('nome')} value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))}/>
          </div>
          <div style={styles.group}>
            <label style={styles.label}>CPF</label>
            <input style={fieldStyle('cpf')} value={form.cpf} onChange={e=>setForm(f=>({...f,cpf:e.target.value}))}/>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.group}>
            <label style={styles.label}>Telefone</label>
            <input style={fieldStyle('telefone')} value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))}/>
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input style={fieldStyle('email')} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          </div>
        </div>

        <div className="toolbar" style={{marginTop:20}}>
          {editingId && <button className="ghost" onClick={clear}>Cancelar</button>}
          <button className="primary" onClick={save}>{editingId?'Salvar Alterações':'Registrar Venda'}</button>
        </div>
      </section>

      {/* HISTÓRICO DE VENDAS (inalterado) */}
      <section className="card" style={{gridColumn:'span 6', height:'85vh', display:'flex', flexDirection:'column'}}>
        <h2>Histórico de Vendas</h2>
        <ul className="list" style={{overflowY:'auto', flex:1, marginTop:'15px', paddingRight:'10px'}}>
          {items.map(v=>(
            <li key={v.id} style={styles.listItem}>
              <span>
                <strong>{v.id} — {v.Cliente?.nome?.trim()?v.Cliente.nome:'(Sem Nome do cliente)'}</strong>
                <br/>
                <span style={{fontSize:'0.85rem', color:'#9ca3af'}}>
                  R$ {Number(v.valor_venda || 0).toLocaleString('pt-BR',{minimumFractionDigits:2})}
                </span>
              </span>
              <div style={styles.btnGroup}>
                <button className="ghost" onClick={()=>fill(v)}>Editar</button>
                <button className="ghost" style={{color:'#ef4444'}} onClick={()=>remove(v.id)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

    </div>
  )
}  