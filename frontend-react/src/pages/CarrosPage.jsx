import { useEffect, useMemo, useState } from 'react'
import { api, fmt } from '../lib/api'

export default function CarrosPage(){
  const [items,setItems]=useState([])
  const [form,setForm]=useState({ placa:'', marca:'', modelo:'', cor:'', ano:'', km:'', valor:'' })
  const valid = useMemo(()=>{
    const placaOk = fmt.placaValid(form.placa)
    const anoNum = Number(form.ano)
    const kmNum = Number(form.km)
    const valorNum = Number(form.valor)
    return placaOk && form.marca && form.modelo && form.cor && anoNum>1900 && anoNum<=2030 && kmNum>=0 && valorNum>=0
  },[form])
  async function fetchAll(){ try{ const {data}=await api.get('/carros'); setItems(Array.isArray(data)?data:[]) }catch(e){ console.error(e) } }
  useEffect(()=>{ fetchAll() },[])
  async function create(){
    const body={
      placa: fmt.placaNorm(form.placa),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      cor: form.cor.trim(),
      ano: Number(form.ano),
      km: Number(form.km||0),
      valor: Number(form.valor||0),
    }
    try{ await api.post('/carros', body); setForm({placa:'',marca:'',modelo:'',cor:'',ano:'',km:'',valor:''}); fetchAll() }
    catch(e){ alert(e.response?.data?.error || 'Erro ao criar carro') }
  }
  return (
    <div className="grid">
      <section className="card" style={{gridColumn:'span 5'}}>
        <h2>Carros</h2>
        <div className="row">
          <div><label>Placa</label><input value={form.placa} onChange={e=>setForm(f=>({...f,placa:e.target.value}))} /></div>
          <div><label>Marca</label><input value={form.marca} onChange={e=>setForm(f=>({...f,marca:e.target.value}))} /></div>
        </div>
        <div className="row">
          <div><label>Modelo</label><input value={form.modelo} onChange={e=>setForm(f=>({...f,modelo:e.target.value}))} /></div>
          <div><label>Cor</label><input value={form.cor} onChange={e=>setForm(f=>({...f,cor:e.target.value}))} /></div>
        </div>
        <div className="row">
          <div><label>Ano</label><input type="number" value={form.ano} onChange={e=>setForm(f=>({...f,ano:e.target.value}))} /></div>
          <div><label>Km</label><input type="number" value={form.km} onChange={e=>setForm(f=>({...f,km:e.target.value}))} /></div>
        </div>
        <div className="row">
          <div><label>Valor</label><input type="number" value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))} /></div>
        </div>
        <div className="toolbar" style={{marginTop:12}}>
          <button className="primary" disabled={!valid} onClick={create}>Cadastrar</button>
        </div>
      </section>
      <section className="card" style={{gridColumn:'span 7'}}>
        <h2>Estoque</h2>
        <ul className="list">
          {items.map(c => (
            <li key={c.placa}><span>{c.placa} — {c.marca} {c.modelo} • {c.cor} • {c.km} km • R$ {Number(c.valor||0).toLocaleString('pt-BR', {minimumFractionDigits:2})} ({c.ano})</span></li>
          ))}
        </ul>
      </section>
    </div>
  )
}
