import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import avatarImg from '../assets/admin.png'

export default function HomePage() {
  const [carros, setCarros] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/carros')
        if (Array.isArray(data)) {
          setCarros(data)
        }
      } catch (e) {
        console.error("Erro ao buscar vitrine:", e)
      }
    })()
  }, [])

  const formatMoney = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const styles = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'relative'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
      padding: '40px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s',
      display: 'flex',
      flexDirection: 'column',
      height: '100%', 
      border: '1px solid #f0f0f0' // Borda sutil para definição
    },
    cardImagePlaceholder: {
      height: '200px',
      backgroundColor: '#e5e7eb', // Cinza um pouco mais escuro para contraste
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      flexShrink: 0
    },
    cardContent: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1, 
    },
    // --- MUDANÇAS AQUI ---
    title: {
      margin: '0 0 8px 0',
      fontSize: '1.25rem',
      fontWeight: '800', // Fonte bem grossa
      color: '#1a1a1a',  // COR ESCURA (Quase preto)
      lineHeight: '1.4',
      
      // Truque para alinhar títulos de 1 ou 2 linhas:
      minHeight: '3.5rem', // Força uma altura mínima (aprox 2 linhas de texto)
      display: '-webkit-box',
      WebkitLineClamp: 2,    // Corta se tiver mais de 2 linhas
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    description: {
      margin: '0',
      color: '#6b7280', // Cinza médio para descrição
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    price: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#059669', // Verde um pouco mais escuro e profissional
      
      // O SEGREDO DO ALINHAMENTO:
      marginTop: 'auto', // Empurra o preço para baixo, colando no botão
      paddingTop: '16px' // Dá um respiro entre a descrição e o preço
    },
    btnComprar: {
      marginTop: '15px',
      width: '100%',
      padding: '12px',
      backgroundColor: '#1f2937', // Botão cinza escuro/preto
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'background 0.2s'
    }
  }

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      <header style={styles.header}></header>

      <main style={styles.grid}>
        {carros.length === 0 ? (
          <p style={{textAlign:'center', gridColumn:'1/-1', color:'#888'}}>Nenhum carro disponível no momento.</p>
        ) : (
          carros.map(carro => (
            <div key={carro.placa} style={styles.card}>
              {carro.foto_url ? (
                <img src={carro.foto_url} alt={`${carro.marca} ${carro.modelo}`} 
                  style={{width:'100%', height:'200px', objectFit:'cover', display:'block'}} />
              ) : (
                <div style={styles.cardImagePlaceholder}>
                  <span style={{fontWeight:'bold'}}>{carro.marca}</span>
                </div>
              )}
              
              <div style={styles.cardContent}>
                {/* Apliquei o estilo novo no Título */}
                <h3 style={styles.title} title={`${carro.marca} ${carro.modelo}`}>
                  {carro.marca} {carro.modelo}
                </h3>
                
                <p style={styles.description}>
                  {carro.cor} • {carro.ano} • {Number(carro.km).toLocaleString('pt-BR')} km
                </p>
                
                {/* Preço com marginTop: auto para alinhar no fundo */}
                <div style={styles.price}>
                  {formatMoney(carro.valor)}
                </div>

                <button 
                  style={styles.btnComprar}
                  onClick={() => alert(`Interesse registrado no ${carro.modelo}! Entre em contato conosco.`)}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#000'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#1f2937'}
                >
                  Tenho Interesse
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}