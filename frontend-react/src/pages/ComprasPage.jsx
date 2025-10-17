import { useEffect, useMemo, useState } from 'react'
import { api, fmt } from '../lib/api'

export default function ComprasPage(){
  const [items,setItems]=useState([])
  const [form,setForm]=useState({
    valor_compra:'', debito:'', valor_parcela:'', parcelas:'', fornecedor:'',
    placa:'', cor:'', marca:'', modelo:'', km:'', ano:''
  })
  const valid = useMemo(()=>{
    const placaOk = fmt.placaValid(form.placa)
    const anoNum = Number(form.ano)
    const parcelasNum = Number(form.parcelas)
    return Number(form.valor_compra)>0 && Number(form.debito)>=0 && Number(form.valor_parcela)>=0 && parcelasNum>=1 && form.fornecedor && placaOk && form.cor && form.marca && form.modelo && anoNum>1900 && anoNum<=2030
  },[form])
  useEffect(()=>{ (async()=>{ try{ const {data}=await api.get('/compras/'); setItems(Array.isArray(data)?data:[]) }catch(e){ console.error(e) } })() },[])

  async function create(){
    const body={
      valor_compra: Number(form.valor_compra),
      debito: Number(form.debito||0),
      valor_parcela: Number(form.valor_parcela||0),
      parcelas: Number(form.parcelas||1),
      fornecedor: form.fornecedor.trim(),
      placa: fmt.placaNorm(form.placa),
      cor: form.cor.trim(),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      km: Number(form.km||0),
      ano: Number(form.ano),
    }
    try{ const {data}= await api.post('/compras/', body); alert(data?.message || 'Compra registrada'); setForm({valor_compra:'',debito:'',valor_parcela:'',parcelas:'',fornecedor:'',placa:'',cor:'',marca:'',modelo:'',km:'',ano:''}); const r=await api.get('/compras/'); setItems(Array.isArray(r.data)?r.data:[]) }
    catch(e){ alert(e.response?.data?.error || 'Erro ao registrar compra') }
  }

  return (
    <div className="grid">
      <section className="card" style={{gridColumn:'span 6'}}>
        <h2>Nova Compra</h2>
        <div className="row">
          <div><label>Fornecedor</label><input value={form.fornecedor} onChange={e=>setForm(f=>({...f,fornecedor:e.target.value}))} /></div>
          <div><label>Valor da compra</label><input type="number" value={form.valor_compra} onChange={e=>setForm(f=>({...f,valor_compra:e.target.value}))} /></div>
        </div>
        <div className="row">
          <div><label>Débito</label><input type="number" value={form.debito} onChange={e=>setForm(f=>({...f,debito:e.target.value}))} /></div>
          <div><label>Valor parcela</label><input type="number" value={form.valor_parcela} onChange={e=>setForm(f=>({...f,valor_parcela:e.target.value}))} /></div>
          <div><label>Parcelas</label><input type="number" value={form.parcelas} onChange={e=>setForm(f=>({...f,parcelas:e.target.value}))} /></div>
        </div>
        <h3>Carro</h3>
        <div className="row">
          <div><label>Placa</label><input value={form.placa} onChange={e=>setForm(f=>({...f,placa:e.target.value}))} /></div>
          <div><label>Cor</label><input value={form.cor} onChange={e=>setForm(f=>({...f,cor:e.target.value}))} /></div>
        </div>
        <div className="row">
          <div><label>Marca</label><input value={form.marca} onChange={e=>setForm(f=>({...f,marca:e.target.value}))} /></div>
          <div><label>Modelo</label><input value={form.modelo} onChange={e=>setForm(f=>({...f,modelo:e.target.value}))} /></div>
        </div>
        <div className="row">
          <div><label>Ano</label><input type="number" value={form.ano} onChange={e=>setForm(f=>({...f,ano:e.target.value}))} /></div>
          <div><label>Km</label><input type="number" value={form.km} onChange={e=>setForm(f=>({...f,km:e.target.value}))} /></div>
        </div>
        <div className="toolbar" style={{marginTop:12}}>
          <button className="primary" disabled={!valid} onClick={create}>Registrar compra</button>
        </div>
      </section>
      <section className="card" style={{gridColumn:'span 6'}}>
        <h2>Compras</h2>
        <ul className="list">
          {items.map(c => (
            <li key={c.id}><span>#{c.id} — {c.fornecedor} — {c.placa} • R$ {Number(c.valor_compra||0).toLocaleString('pt-BR',{minimumFractionDigits:2})} • {c.parcelas}x de R$ {Number(c.valor_parcela||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></li>
          ))}
        </ul>
      </section>
    </div>
  )
}
