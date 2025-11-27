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

  const styles = {
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' },
    row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' },
    group: { display: 'flex', flexDirection: 'column', gap: '8px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', width:'100%', outline:'none' },
    label: { fontSize: '0.9rem', color: '#9ca3af' }
  }

  return (
    <div className="grid">
      <section className="card" style={{gridColumn:'span 6'}}>
        <h2 style={{marginBottom:'20px'}}>Nova Compra</h2>
        
        <div style={styles.row}>
          <div style={styles.group}><label style={styles.label}>Fornecedor</label><input style={styles.input} value={form.fornecedor} onChange={e=>setForm(f=>({...f,fornecedor:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Valor da compra</label><input style={styles.input} type="number" value={form.valor_compra} onChange={e=>setForm(f=>({...f,valor_compra:e.target.value}))} /></div>
        </div>
        
        <div style={styles.row3}>
          <div style={styles.group}><label style={styles.label}>Débito</label><input style={styles.input} type="number" value={form.debito} onChange={e=>setForm(f=>({...f,debito:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Valor parcela</label><input style={styles.input} type="number" value={form.valor_parcela} onChange={e=>setForm(f=>({...f,valor_parcela:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Parcelas</label><input style={styles.input} type="number" value={form.parcelas} onChange={e=>setForm(f=>({...f,parcelas:e.target.value}))} /></div>
        </div>

        <h3 style={{marginTop:'25px', marginBottom:'15px', borderBottom:'1px solid #333', paddingBottom:'5px'}}>Dados do Carro</h3>
        
        <div style={styles.row}>
          <div style={styles.group}><label style={styles.label}>Placa</label><input style={styles.input} value={form.placa} onChange={e=>setForm(f=>({...f,placa:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Cor</label><input style={styles.input} value={form.cor} onChange={e=>setForm(f=>({...f,cor:e.target.value}))} /></div>
        </div>

        <div style={styles.row}>
          <div style={styles.group}><label style={styles.label}>Marca</label><input style={styles.input} value={form.marca} onChange={e=>setForm(f=>({...f,marca:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Modelo</label><input style={styles.input} value={form.modelo} onChange={e=>setForm(f=>({...f,modelo:e.target.value}))} /></div>
        </div>

        <div style={styles.row}>
          <div style={styles.group}><label style={styles.label}>Ano</label><input style={styles.input} type="number" value={form.ano} onChange={e=>setForm(f=>({...f,ano:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Km</label><input style={styles.input} type="number" value={form.km} onChange={e=>setForm(f=>({...f,km:e.target.value}))} /></div>
        </div>

        <div className="toolbar" style={{marginTop:20}}>
          <button className="primary" disabled={!valid} onClick={create}>Registrar compra</button>
        </div>
      </section>

      <section className="card" style={{gridColumn:'span 6'}}>
        <h2>Histórico</h2>
        <ul className="list" style={{marginTop:'15px'}}>
          {items.map(c => (
            <li key={c.id}><span>#{c.id} — {c.fornecedor} — {c.placa} • R$ {Number(c.valor_compra||0).toLocaleString('pt-BR',{minimumFractionDigits:2})} • {c.parcelas}x de R$ {Number(c.valor_parcela||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span></li>
          ))}
        </ul>
      </section>
    </div>
  )
}