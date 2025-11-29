import { useEffect, useMemo, useState } from 'react'
import { api, fmt } from '../lib/api'

export default function CarrosPage(){
  const [items,setItems]=useState([])
  // Adicionei um estado 'editingPlaca' para saber qual carro estamos editando, caso a placa mude
  const [editingPlaca, setEditingPlaca] = useState(null) 
  const [form,setForm]=useState({ placa:'', marca:'', modelo:'', cor:'', ano:'', km:'', valor:'', foto_url:'' })
  
  const valid = useMemo(()=>{
    const placaOk = fmt.placaValid(form.placa)
    const anoNum = Number(form.ano)
    const kmNum = Number(form.km)
    const valorNum = Number(form.valor)
    return placaOk && form.marca && form.modelo && form.cor && anoNum>1900 && anoNum<=2030 && kmNum>=0 && valorNum>=0
  },[form])

  async function fetchAll(){ try{ const {data}=await api.get('/carros'); setItems(Array.isArray(data)?data:[]) }catch(e){ console.error(e) } }
  useEffect(()=>{ fetchAll() },[])

  // Preenche o formulário para edição
  function fill(c){
    setEditingPlaca(c.placa) // Guarda a placa original para saber quem atualizar
    setForm({
      placa: c.placa,
      marca: c.marca,
      modelo: c.modelo,
      cor: c.cor,
      ano: String(c.ano),
      km: String(c.km),
      valor: String(c.valor),
      foto_url: c.foto_url || ''
    })
  }

  function clear(){
    setEditingPlaca(null)
    setForm({placa:'',marca:'',modelo:'',cor:'',ano:'',km:'',valor:'',foto_url:''})
  }

  async function save(){
    const body={
      placa: fmt.placaNorm(form.placa),
      marca: form.marca.trim(),
      modelo: form.modelo.trim(),
      cor: form.cor.trim(),
      ano: Number(form.ano),
      km: Number(form.km||0),
      valor: Number(form.valor||0),
      foto_url: form.foto_url.trim(),
    }

    try {
      if(editingPlaca) {
        // Atualizar
        await api.put(`/carros/${editingPlaca}`, body)
        alert('Carro atualizado!')
      } else {
        // Criar
        await api.post('/carros', body)
        alert('Carro cadastrado!')
      }
      clear()
      fetchAll()
    } catch(e){ 
      alert(e.response?.data?.error || 'Erro ao salvar carro') 
    }
  }

  async function remove(placa){
    if(!confirm(`Tem certeza que deseja excluir o carro ${placa}?`)) return
    try {
      await api.delete(`/carros/${placa}`)
      alert('Excluído com sucesso')
      clear()
      fetchAll()
    } catch(e){
      alert('Erro ao excluir')
    }
  }

  // Estilos Comuns
  const styles = {
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' },
    group: { display: 'flex', flexDirection: 'column', gap: '8px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', width:'100%', outline:'none' },
    label: { fontSize: '0.9rem', color: '#9ca3af' },
    // Estilo novo para o item da lista (Caixa escura)
    listItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#111827', // Fundo escuro
        border: '1px solid #374151', // Borda sutil
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '10px'
    },
    btnGroup: { display: 'flex', gap: '10px' }
  }

  return (
    <div className="grid">
      <section className="card" style={{gridColumn:'span 5'}}>
        <h2 style={{marginBottom:'20px'}}>Carros</h2>
        
        <div style={styles.row}>
          <div style={styles.group}><label style={styles.label}>Placa</label><input style={styles.input} value={form.placa} onChange={e=>setForm(f=>({...f,placa:e.target.value}))} disabled={!!editingPlaca} /></div>
          <div style={styles.group}><label style={styles.label}>Marca</label><input style={styles.input} value={form.marca} onChange={e=>setForm(f=>({...f,marca:e.target.value}))} /></div>
        </div>

        <div style={styles.row}>
           <div style={styles.group}><label style={styles.label}>Modelo</label><input style={styles.input} value={form.modelo} onChange={e=>setForm(f=>({...f,modelo:e.target.value}))} /></div>
           <div style={styles.group}><label style={styles.label}>Cor</label><input style={styles.input} value={form.cor} onChange={e=>setForm(f=>({...f,cor:e.target.value}))} /></div>
        </div>

        <div style={styles.row}>
          <div style={styles.group}><label style={styles.label}>Ano</label><input style={styles.input} type="number" value={form.ano} onChange={e=>setForm(f=>({...f,ano:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Km</label><input style={styles.input} type="number" value={form.km} onChange={e=>setForm(f=>({...f,km:e.target.value}))} /></div>
        </div>

        <div style={styles.group}>
            <label style={styles.label}>Valor (R$)</label>
            <input style={styles.input} type="number" value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))} />
        </div>

        <div style={styles.group}>
            <label style={styles.label}>URL da Foto</label>
            <input style={styles.input} value={form.foto_url} onChange={e=>setForm(f=>({...f,foto_url:e.target.value}))} placeholder="https://exemplo.com/foto.jpg" />
        </div>

        <div className="toolbar" style={{marginTop:20}}>
          {editingPlaca && <button className="ghost" onClick={clear}>Cancelar</button>}
          <button className="primary" disabled={!valid} onClick={save}>{editingPlaca ? 'Atualizar' : 'Cadastrar'}</button>
        </div>
      </section>

      <section className="card" style={{gridColumn:'span 7'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
            <h2>Estoque</h2>
            <span className="kbd" style={{background:'#374151', color:'white', padding:'2px 8px', borderRadius:'4px', fontSize:'0.8rem'}}>
                {items.length} itens
            </span>
        </div>
        
        <ul className="list">
          {items.map(c => (
            <li key={c.placa} style={styles.listItem}>
                <span>
                    <strong>{c.placa}</strong> — {c.marca} {c.modelo} • {c.cor} <br/>
                    <span style={{fontSize:'0.85rem', color:'#9ca3af'}}>
                        {c.km} km • R$ {Number(c.valor||0).toLocaleString('pt-BR', {minimumFractionDigits:2})} ({c.ano})
                    </span>
                </span>
                
                <div style={styles.btnGroup}>
                    <button className="ghost" onClick={() => fill(c)} style={{fontSize:'0.8rem', padding:'5px 10px'}}>Editar</button>
                    <button className="ghost" onClick={() => remove(c.placa)} style={{fontSize:'0.8rem', padding:'5px 10px', color:'#ef4444'}}>Excluir</button>
                </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}