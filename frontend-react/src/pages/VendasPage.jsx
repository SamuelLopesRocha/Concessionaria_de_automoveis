import { useEffect, useMemo, useState } from 'react'
import { api, fmt } from '../lib/api'

export default function VendasPage(){
  const [items,setItems]=useState([])
  const [editingId, setEditingId] = useState(null)
  const [form,setForm]=useState({
    id_carro:'', id_vendedor:'', data_venda:'', valor_total:'', forma_pagamento:'à vista', parcelas:'', juros:'', desconto:'', comissao_vendedor:'',
    nome:'', cpf:'', telefone:'', endereco:'', email:''
  })
  
  const valid = useMemo(()=>{
    const cpfOk = fmt.onlyDigits(form.cpf).length===11
    return form.nome && cpfOk && form.valor_total && form.forma_pagamento
  },[form])

  async function fetchAll(){ try{ const {data}=await api.get('/vendas/'); setItems(Array.isArray(data)?data:[]) }catch(e){ console.error(e) } }
  useEffect(()=>{ fetchAll() },[])

  function fill(v){
    setEditingId(v.id_venda || v.id) // Ajuste conforme seu backend retorna o ID
    setForm({
        id_carro: String(v.id_carro||''),
        id_vendedor: String(v.id_vendedor||''),
        // Tenta pegar só a data YYYY-MM-DD
        data_venda: v.data_venda ? v.data_venda.split('T')[0] : '',
        valor_total: String(v.valor_total||''),
        forma_pagamento: v.forma_pagamento,
        parcelas: String(v.parcelas||''),
        juros: String(v.juros||''),
        desconto: String(v.desconto||''),
        comissao_vendedor: String(v.comissao_vendedor||''),
        nome: v.nome,
        cpf: fmt.cpf(v.cpf),
        telefone: v.telefone,
        endereco: v.endereco,
        email: v.email
    })
  }

  function clear(){
    setEditingId(null)
    setForm({id_carro:'',id_vendedor:'',data_venda:'',valor_total:'',forma_pagamento:'à vista',parcelas:'',juros:'',desconto:'',comissao_vendedor:'',nome:'',cpf:'',telefone:'',endereco:'',email:''})
  }

  async function save(){
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
    
    try{ 
        if(editingId){
            await api.put(`/vendas/${editingId}`, body)
            alert('Venda atualizada')
        } else {
            await api.post('/vendas/', body)
            alert('Venda registrada')
        }
        clear()
        fetchAll()
    }
    catch(e){ alert(e.response?.data?.error || 'Erro ao salvar venda') }
  }

  async function remove(id){
      if(!confirm('Deseja excluir esta venda?')) return
      try {
          await api.delete(`/vendas/${id}`)
          alert('Venda excluída')
          fetchAll()
      } catch(e){ alert('Erro ao excluir') }
  }

  const styles = {
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' },
    row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' },
    group: { display: 'flex', flexDirection: 'column', gap: '8px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', width:'100%', outline:'none' },
    label: { fontSize: '0.9rem', color: '#9ca3af' },
    listItem: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#111827',
        border: '1px solid #374151',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '10px'
    },
    btnGroup: { display: 'flex', gap: '10px' }
  }

  return (
    <div className="grid">
      <section className="card" style={{gridColumn:'span 6'}}>
        <h2 style={{marginBottom:'20px'}}>Nova Venda</h2>
        
        <div style={styles.row}>
          <div style={styles.group}><label style={styles.label}>Valor total</label><input style={styles.input} type="number" value={form.valor_total} onChange={e=>setForm(f=>({...f,valor_total:e.target.value}))} /></div>
          <div style={styles.group}>
            <label style={styles.label}>Forma pagamento</label>
            <select style={styles.input} value={form.forma_pagamento} onChange={e=>setForm(f=>({...f,forma_pagamento:e.target.value}))}>
              <option>à vista</option>
              <option>parcelado</option>
            </select>
          </div>
        </div>

        <div style={styles.row3}>
          <div style={styles.group}><label style={styles.label}>Parcelas</label><input style={styles.input} type="number" value={form.parcelas} onChange={e=>setForm(f=>({...f,parcelas:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Juros (%)</label><input style={styles.input} type="number" value={form.juros} onChange={e=>setForm(f=>({...f,juros:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Desconto</label><input style={styles.input} type="number" value={form.desconto} onChange={e=>setForm(f=>({...f,desconto:e.target.value}))} /></div>
        </div>

        <div style={styles.row}>
          <div style={styles.group}><label style={styles.label}>Comissão vendedor</label><input style={styles.input} type="number" value={form.comissao_vendedor} onChange={e=>setForm(f=>({...f,comissao_vendedor:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Data</label><input style={styles.input} type="date" value={form.data_venda} onChange={e=>setForm(f=>({...f,data_venda:e.target.value}))} /></div>
        </div>

        <h3 style={{marginTop:'25px', marginBottom:'15px', borderBottom:'1px solid #333', paddingBottom:'5px'}}>Cliente</h3>
        
        <div style={styles.row}>
          <div style={styles.group}><label style={styles.label}>Nome</label><input style={styles.input} value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>CPF</label><input style={styles.input} value={form.cpf} onChange={e=>setForm(f=>({...f,cpf:e.target.value}))} placeholder="000.000.000-00" /></div>
        </div>

        <div style={styles.row}>
          <div style={styles.group}><label style={styles.label}>Telefone</label><input style={styles.input} value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))} /></div>
          <div style={styles.group}><label style={styles.label}>Email</label><input style={styles.input} value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
        </div>

        <div style={styles.group}>
            <label style={styles.label}>Endereço</label>
            <input style={styles.input} value={form.endereco} onChange={e=>setForm(f=>({...f,endereco:e.target.value}))} />
        </div>

        <div className="toolbar" style={{marginTop:20}}>
          {editingId && <button className="ghost" onClick={clear}>Cancelar</button>}
          <button className="primary" disabled={!valid} onClick={save}>{editingId ? 'Salvar Alterações' : 'Registrar Venda'}</button>
        </div>
      </section>

      <section className="card" style={{gridColumn:'span 6'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
            <h2>Histórico de Vendas</h2>
            <span className="kbd" style={{background:'#374151', color:'white', padding:'2px 8px', borderRadius:'4px', fontSize:'0.8rem'}}>
                {items.length} itens
            </span>
        </div>
        
        <ul className="list">
          {items.map(v => (
            <li key={v.id_venda || v.id} style={styles.listItem}>
                <span>
                    <strong>#{v.id_venda || v.id}</strong> — {v.nome} <br/> 
                    <span style={{fontSize:'0.85rem', color:'#9ca3af'}}>
                        R$ {Number(v.valor_total||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}
                    </span>
                </span>
                
                <div style={styles.btnGroup}>
                    <button className="ghost" onClick={() => fill(v)} style={{fontSize:'0.8rem', padding:'5px 10px'}}>Editar</button>
                    <button className="ghost" onClick={() => remove(v.id_venda || v.id)} style={{fontSize:'0.8rem', padding:'5px 10px', color:'#ef4444'}}>Excluir</button>
                </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}