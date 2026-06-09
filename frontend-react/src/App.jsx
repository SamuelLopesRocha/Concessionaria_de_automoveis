import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import logo from './assets/logo.svg'
import HomePage from './pages/HomePage.jsx'
import FuncionariosPage from './pages/FuncionariosPage.jsx'
import CarrosPage from './pages/CarrosPage.jsx'
import ComprasPage from './pages/ComprasPage.jsx'
import VendasPage from './pages/VendasPage.jsx'
import VendasClientesPage from './pages/VendasClientesPage.jsx'
import SeguroPage from "./pages/SeguroPage"
import EnvioDocumentos from "./pages/EnvioDocumentos"
import ComissaoPage from "./pages/ComissaoPage"
import EscalaPage from "./pages/EscalaPage"
import { FaGear } from "react-icons/fa6"

export default function App() {
  const location = useLocation()

  const isPublicPage = location.pathname === '/home'

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <div className="brand">
          <img src={logo} alt="Pluto" />
          <div>
            <div>Concessionária Pluto</div>
            <div className="tagline">Sistema de Gestão</div>
          </div>
        </div>

        {/* MENU com scroll horizontal para evitar sobreposição */}
        <nav className="nav-scroll">

          {!isPublicPage && (
            <>
              <NavLink to="/" end>Início</NavLink>
              <NavLink to="/funcionarios">Funcionários</NavLink>
              <NavLink to="/carros">Carros</NavLink>
              <NavLink to="/compras">Compras</NavLink>
              <NavLink to="/vendas">Vendas</NavLink>
              <NavLink to="/seguro">Seguro</NavLink>
              <NavLink to="/vendas-clientes">Documentação</NavLink>
              <NavLink to="/envio-documentos">Documentos</NavLink>
              <NavLink to="/comissao"> Comissão </NavLink>
              <NavLink to="/escala">Escalas</NavLink>

              <a
                href="http://localhost:8501"
                target="_blank"
                rel="noopener noreferrer"
              >
                Dashboards
              </a>
            </>
          )}

          <NavLink
            to={isPublicPage ? "/" : "/home"}
            title={isPublicPage ? "Painel Admin" : "Site Público"}
          >
            <FaGear />
          </NavLink>

        </nav>
      </header>

      {/* CONTEÚDO */}
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/funcionarios" element={<FuncionariosPage />} />
          <Route path="/carros" element={<CarrosPage />} />
          <Route path="/compras" element={<ComprasPage />} />
          <Route path="/vendas" element={<VendasPage />} />
          <Route path="/seguro" element={<SeguroPage />} />
          <Route path="/vendas-clientes" element={<VendasClientesPage />} />
          <Route path="/envio-documentos" element={<EnvioDocumentos />} />
          <Route path="/comissao" element={<ComissaoPage />} />
          <Route path="/escala" element={<EscalaPage />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} Concessionária
      </footer>
    </div>
  )
}