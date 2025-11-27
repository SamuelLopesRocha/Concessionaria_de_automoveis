import { NavLink, Route, Routes, useLocation } from 'react-router-dom' // 1. Adicionado useLocation
import { useEffect, useMemo, useState } from 'react'
import { api } from './lib/api'
import logo from './assets/logo.svg'
import HomePage from './pages/HomePage.jsx'
import FuncionariosPage from './pages/FuncionariosPage.jsx'
import CarrosPage from './pages/CarrosPage.jsx'
import ComprasPage from './pages/ComprasPage.jsx'
import VendasPage from './pages/VendasPage.jsx'
import { FaGear } from "react-icons/fa6";

export default function App() {
  const location = useLocation(); // 2. Pegamos a localização atual
  
  // Verifica se estamos EXATAMENTE na página pública (/home)
  const isPublicPage = location.pathname === '/home';

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <img src={logo} alt="Pluto" />
          <div>
            <div>Concessionária Pluto (nome provisório)</div>
            <div className="tagline">Sistema de Gestão</div>
          </div>
        </div>

        <nav>
        {/* Se NÃO for a página pública, mostra os links do menu admin */}
        {!isPublicPage && (
          <>
            <NavLink to="/" end>Início</NavLink>
            <NavLink to="/funcionarios">Funcionários</NavLink>
            <NavLink to="/carros">Carros</NavLink>
            <NavLink to="/compras">Compras</NavLink>
            <NavLink to="/vendas">Vendas</NavLink>
            <a href="http://localhost:8501" target="_blank" rel="noopener noreferrer">Dashboards</a>
          </>
        )}

        {/* A MÁGICA ESTÁ AQUI: */}
        {/* Se estiver na HomePage (/home), o link aponta para o Admin (/) */}
        {/* Se estiver no Admin, o link aponta para a HomePage (/home) */}
        <NavLink 
          to={isPublicPage ? "/" : "/home"} 
          title={isPublicPage ? "Ir para o Painel Admin" : "Ver Site Público (HomePage)"}
        >
          <FaGear />
        </NavLink>
      </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/funcionarios" element={<FuncionariosPage />} />
          <Route path="/carros" element={<CarrosPage />} />
          <Route path="/compras" element={<ComprasPage />} />
          <Route path="/vendas" element={<VendasPage />} />
        </Routes>
      </main>

      <footer className="footer">© {new Date().getFullYear()} Concessionária</footer>
    </div>
  )
}

// MANTIVE O SEU COMPONENTE HOME ANTIGO ABAIXO (DASHBOARD INTERNO)
function Home() {
  const [cars, setCars] = useState([])
  const [kpi, setKpi] = useState({ carros: 0, compras: 0, vendas: 0 })
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    (async () => {
      try {
        const [carrosR, comprasR, vendasR] = await Promise.all([
          api.get('/carros'),
          api.get('/compras/'),
          api.get('/vendas/'),
        ])
        const carros = Array.isArray(carrosR.data) ? carrosR.data : []
        const compras = Array.isArray(comprasR.data) ? comprasR.data : []
        const vendas = Array.isArray(vendasR.data) ? vendasR.data : []
        setCars(carros.slice(0, 8))
        setKpi({ carros: carros.length, compras: compras.length, vendas: vendas.length })
      } catch (e) {
        console.error('Falha ao carregar dados da Home', e)
      }
    })()
  }, [])

  const current = useMemo(() => (cars.length ? cars[idx % cars.length] : null), [cars, idx])

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Gestão de Concessionária</h1>
          <p>Gestão completa de estoque, compras, vendas e funcionários!</p>
        </div>
      </section>

      <section className="kpi">
        <div className="item">
          <div className="label">Estoque</div>
          <div className="value">{kpi.carros}</div>
        </div>
        <div className="item">
          <div className="label">Compras</div>
          <div className="value">{kpi.compras}</div>
        </div>
        <div className="item">
          <div className="label">Vendas</div>
          <div className="value">{kpi.vendas}</div>
        </div>
      </section>

      <section className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <h2>Destaques</h2>
          <div className="toolbar">
            <button className="ghost" onClick={()=> setIdx(i=> (i - 1 + (cars.length||1)) % (cars.length||1))}>◀</button>
            <button className="ghost" onClick={()=> setIdx(i=> (i + 1) % (cars.length||1))}>▶</button>
          </div>
        </div>
        <div className="carousel">
          {current ? (
            <div className="carousel-card">
              <div className="title">{current.marca} {current.modelo} <span className="muted">({current.ano})</span></div>
              <div className="meta">Placa {current.placa} • {current.cor} • {Number(current.km||0).toLocaleString('pt-BR')} km</div>
              <div className="price">R$ {Number(current.valor||0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          ) : (
            <div className="muted">Sem carros cadastrados ainda</div>
          )}
        </div>
      </section>
    </>
  )
}