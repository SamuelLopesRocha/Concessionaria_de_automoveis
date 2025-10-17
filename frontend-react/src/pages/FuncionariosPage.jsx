import { useEffect, useMemo, useState } from 'react'
import { api, fmt } from '../lib/api'

export default function FuncionariosPage(){
  const [items,setItems] = useState([])
  const [loading,setLoading] = useState(false)
  const [form,setForm] = useState({ id:'', nome:'', cargo:'', idade:'', cpf:'' })

  const valid = useMemo(()=>{
    const idadeNum = Number(form.idade)
    const cpfDigits = fmt.onlyDigits(form.cpf)
    return form.nome && form.cargo && !Number.isNaN(idadeNum) && idadeNum>0 && cpfDigits.length===11
  },[form])

  async function fetchAll(){
    setLoading(true)
    try{ const {data}= await api.get('/funcionarios'); setItems(Array.isArray(data)?data:[]) } 
    catch(e){ console.error(e); alert('Erro ao carregar funcionários') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ fetchAll() },[])

  function fill(f){ setForm({ id:f.id, nome:f.nome, cargo:f.cargo, idade:String(f.idade??''), cpf: fmt.cpf(f.cpf) }) }
  function clear(){ setForm({ id:'', nome:'', cargo:'', idade:'', cpf:'' }) }

  async function create(){
    const body={ nome:form.nome.trim(), cargo:form.cargo.trim(), idade:Number(form.idade), cpf: fmt.onlyDigits(form.cpf) }
    try{ const {data}= await api.post('/funcionarios', body); alert(data?.message || 'Criado'); clear(); fetchAll() }
    catch(e){ console.error(e); alert(e.response?.data?.error || 'Erro ao criar') }
  }

  async function update(){
    if(!form.id) return alert('Selecione um funcionário da lista')
    const body={ nome:form.nome.trim(), cargo:form.cargo.trim(), idade:Number(form.idade) }
    try{ const {data}= await api.put(`/funcionarios/${form.id}`, body); alert(data?.message || 'Atualizado'); fetchAll() }
    catch(e){ console.error(e); alert(e.response?.data?.error || 'Erro ao atualizar') }
  }

  async function remove(){
    if(!form.id) return alert('Selecione um funcionário da lista')
    if(!confirm('Tem certeza que deseja deletar?')) return
    try{ const {data}= await api.delete(`/funcionarios/${form.id}`); alert(data?.message || 'Deletado'); clear(); fetchAll() }
    catch(e){ console.error(e); alert(e.response?.data?.error || 'Erro ao deletar') }
  }

  return (
    <div className="grid">
      <section className="card" style={{gridColumn:'span 5'}}>
        <h2>Funcionários</h2>
        <p style={{color:'var(--muted)'}}>Cadastre e gerencie sua equipe.</p>
        <div className="row">
          <div>
            <label>Nome</label>
            <input value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Nome" />
          </div>
          <div>
            <label>Cargo</label>
            <input value={form.cargo} onChange={e=>setForm(f=>({...f,cargo:e.target.value}))} placeholder="Cargo" />
          </div>
        </div>
        <div className="row">
          <div>
            <label>Idade</label>
            <input type="number" value={form.idade} onChange={e=>setForm(f=>({...f,idade:e.target.value}))} placeholder="Idade" />
          </div>
          <div>
            <label>CPF</label>
            <input value={form.cpf} onChange={e=>setForm(f=>({...f,cpf: e.target.value}))} placeholder="000.000.000-00" />
          </div>
        </div>
        <div className="toolbar" style={{marginTop:12}}>
          <button className="ghost" onClick={clear}>Limpar</button>
          <button className="primary" disabled={!valid} onClick={form.id?update:create}>{form.id?'Atualizar':'Criar'}</button>
        </div>
      </section>
      <section className="card" style={{gridColumn:'span 7'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2>Lista</h2>
          <div>
            <span className="kbd">{loading? 'Atualizando...' : `${items.length} itens`}</span>
          </div>
        </div>
        <ul className="list">
          {items.map(f=> (
            <li key={f.id} onClick={()=>fill(f)}>
              <span>{f.id} — {f.nome} • {f.cargo} • {f.idade} anos • CPF {fmt.cpf(f.cpf)}</span>
              <div className="row" style={{flex:'0 0 auto'}}>
                <button className="ghost" onClick={(e)=>{e.stopPropagation(); fill(f)}}>Editar</button>
                <button className="ghost" onClick={(e)=>{e.stopPropagation(); setForm({id:f.id, nome:f.nome, cargo:f.cargo, idade:String(f.idade), cpf:fmt.cpf(f.cpf)}); remove();}}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
