import { useEffect, useMemo, useState } from 'react'
import { api, fmt } from '../lib/api'

export default function VendasPage(){
  const [items,setItems]=useState([])
  const [form,setForm]=useState({
    id_carro:'', id_vendedor:'', data_venda:'', valor_total:'', forma_pagamento:'à vista', parcelas:'', juros:'', desconto:'', comissao_vendedor:'',
    nome:'', cpf:'', telefone:'', endereco:'', email:''
  })
  const valid = useMemo(()=>{
    const cpfOk = fmt.onlyDigits(form.cpf).length===11
    return form.nome && cpfOk && form.valor_total && form.forma_pagamento
  },[form])
  useEffect(()=>{ (async()=>{ try{ const {data}=await api.get('/vendas/'); setItems(Array.isArray(data)?data:[]) }catch(e){ console.error(e) } })() },[])

  async function create(){
    const body={
      id_carro: Number(form.id_carro||0),
      id_vendedor: Number(form.id_vendedor||0),
      data_venda: form.data_venda || new Date().toISOString().slice(0,10),
      valor_total: Number(form.valor_total),
      forma_pagamento: form.forma_pagamento,
      parcelas: Number(form.parcelas||0),
      juros: Number(form.juros||0),
      desconto: Number(form.desconto||0),
      comissao_vendedor: Number(form.comissao_vendedor||0),
      nome: form.nome.trim(),
      cpf: fmt.onlyDigits(form.cpf),
      telefone: form.telefone.trim(),
      endereco: form.endereco.trim(),
      email: form.email.trim(),
    }
    try{ const {data}= await api.post('/vendas/', body); alert(data?.message || 'Venda registrada'); setForm({id_carro:'',id_vendedor:'',data_venda:'',valor_total:'',forma_pagamento:'à vista',parcelas:'',juros:'',desconto:'',comissao_vendedor:'',nome:'',cpf:'',telefone:'',endereco:'',email:''}); const r=await api.get('/vendas/'); setItems(Array.isArray(r.data)?r.data:[]) }
    catch(e){ alert(e.response?.data?.error || 'Erro ao registrar venda') }
  }

  return (
    <div className="grid">
      <section className="card" style={{gridColumn:'span 6'}}>
        <h2>Nova Venda</h2>
        <div className="row">
          <div><label>Valor total</label><input type="number" value={form.valor_total} onChange={e=>setForm(f=>({...f,valor_total:e.target.value}))} /></div>
          <div><label>Forma pagamento</label>
            <select value={form.forma_pagamento} onChange={e=>setForm(f=>({...f,forma_pagamento:e.target.value}))}>
              <option>à vista</option>
              <option>parcelado</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div><label>Parcelas</label><input type="number" value={form.parcelas} onChange={e=>setForm(f=>({...f,parcelas:e.target.value}))} /></div>
          <div><label>Juros (%)</label><input type="number" value={form.juros} onChange={e=>setForm(f=>({...f,juros:e.target.value}))} /></div>
          <div><label>Desconto</label><input type="number" value={form.desconto} onChange={e=>setForm(f=>({...f,desconto:e.target.value}))} /></div>
        </div>
        <div className="row">
          <div><label>Comissão vendedor</label><input type="number" value={form.comissao_vendedor} onChange={e=>setForm(f=>({...f,comissao_vendedor:e.target.value}))} /></div>
          <div><label>Data</label><input type="date" value={form.data_venda} onChange={e=>setForm(f=>({...f,data_venda:e.target.value}))} /></div>
        </div>
        <h3>Cliente</h3>
        <div className="row">
          <div><label>Nome</label><input value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} /></div>
          <div><label>CPF</label><input value={form.cpf} onChange={e=>setForm(f=>({...f,cpf:e.target.value}))} placeholder="000.000.000-00" /></div>
        </div>
        <div className="row">
          <div><label>Telefone</label><input value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))} /></div>
          <div><label>Email</label><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
        </div>
        <div className="row">
          <div><label>Endereço</label><input value={form.endereco} onChange={e=>setForm(f=>({...f,endereco:e.target.value}))} /></div>
        </div>
        <div className="toolbar" style={{marginTop:12}}>
          <button className="primary" disabled={!valid} onClick={create}>Registrar venda</button>
        </div>
      </section>
      <section className="card" style={{gridColumn:'span 6'}}>
        <h2>Vendas</h2>
        <ul className="list">
          {items.map(v => (
            <li key={v.id_venda}><span>#{v.id_venda} — {v.nome} — R$ {Number(v.valor_total||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></li>
          ))}
        </ul>
      </section>
    </div>
  )
}
