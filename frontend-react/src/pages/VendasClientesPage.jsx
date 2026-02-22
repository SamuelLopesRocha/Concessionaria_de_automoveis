import { useEffect, useState } from "react"
import { api } from "../lib/api"
import logo from "../assets/logo.svg"

export default function VendasClientesDoc() {
  const [vendas, setVendas] = useState([])

  useEffect(() => {
    fetchVendas()
  }, [])

  const fetchVendas = async () => {
    try {
      const { data } = await api.get("/vendas/")
      setVendas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Erro ao buscar vendas:", err)
    }
  }

  const corStatus = (status) => {
    if (status === "VERIFICADO") return "status-verificado"
    if (status === "PENDENTE") return "status-pendente"
    return "status-nao-enviado"
  }

  const reenviarEmail = async (clienteId) => {
    try {
      await api.post(`/clientes/${clienteId}/reenviar-email`)
      fetchVendas()
    } catch (err) {
      console.error("Erro ao reenviar email:", err)
    }
  }

  // ===== RESUMO =====
    const total = vendas.length
    const verificados = vendas.filter(v => v.Cliente?.status_email === "VERIFICADO").length
    const pendentes = vendas.filter(v => v.Cliente?.status_email === "PENDENTE").length
    const naoEnviados = vendas.filter(v => {
    const s = v.Cliente?.status_email
  return !s || (s !== "VERIFICADO" && s !== "PENDENTE")
}).length

  const styles = {
    container: { padding: "20px", backgroundColor: "#111827", minHeight: "100vh", fontFamily: "sans-serif" },
    header: { display: "flex", alignItems: "center", marginBottom: "30px" },
    logo: { width: 60, marginRight: "15px" },
    docHeader: { marginBottom: "20px", color: "white" },
    docSummary: { display: "flex", gap: "15px", marginBottom: "30px" },
    summaryCard: { flex: 1, backgroundColor: "#1f2937", padding: "20px", borderRadius: "8px", textAlign: "center", color: "white" },
    summaryGreen: { backgroundColor: "#22c55e" },
    summaryYellow: { backgroundColor: "#facc15", color: "#111827" },
    summaryRed: { backgroundColor: "#ef4444" },
    card: { backgroundColor: "#1f2937", padding: "20px", borderRadius: "8px", marginBottom: "20px", color: "white" },
    tableWrapper: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "12px", borderBottom: "2px solid #374151", color: "#d1d5db" },
    td: { padding: "12px", borderBottom: "1px solid #374151", color: "#e5e7eb" },
    trHover: { backgroundColor: "#1e293b" },
    btn: { padding: "6px 12px", borderRadius: "6px", backgroundColor: "#3b82f6", color: "white", border: "none", cursor: "pointer" },
    status: { padding: "4px 8px", borderRadius: "4px", fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem" },
    statusVerificado: { backgroundColor: "#22c55e", color: "white" },
    statusPendente: { backgroundColor: "#facc15", color: "#111827" },
    statusNaoEnviado: { backgroundColor: "#ef4444", color: "white" }
  }

  const getStatusStyle = (status) => {
    if (status === "VERIFICADO") return { ...styles.status, ...styles.statusVerificado }
    if (status === "PENDENTE") return { ...styles.status, ...styles.statusPendente }
    return { ...styles.status, ...styles.statusNaoEnviado }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <h1>Verificação de Emails</h1>
      </header>

      {/* ===== RESUMO ===== */}
      <div style={styles.docSummary}>
        <div style={styles.summaryCard}>
          <span>Total Registros</span>
          <br />
          <strong>{total}</strong>
        </div>
        <div style={{ ...styles.summaryCard, ...styles.summaryGreen }}>
          <span>Verificados</span>
          <br />
          <strong>{verificados}</strong>
        </div>
        <div style={{ ...styles.summaryCard, ...styles.summaryYellow }}>
          <span>Pendentes</span>
          <br />
          <strong>{pendentes}</strong>
        </div>
        <div style={{ ...styles.summaryCard, ...styles.summaryRed }}>
          <span>Não Enviados</span>
          <br />
          <strong>{naoEnviados}</strong>
        </div>
      </div>

      {/* ===== TABELA ===== */}
      <section style={styles.card}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Data</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => (
                <tr
                  key={venda.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1e293b"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={styles.td}>{venda.Cliente?.nome || "(Sem nome)"}</td>
                  <td style={styles.td}>{venda.Cliente?.email || "-"}</td>
                  <td style={styles.td}>{venda.data_venda}</td>
                  <td style={styles.td}>
                    <span style={getStatusStyle(venda.Cliente?.status_email)}>
                      {venda.Cliente?.status_email || "NÃO ENVIADO"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {venda.Cliente?.status_email !== "VERIFICADO" && venda.Cliente && (
                      <button
                        style={styles.btn}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = "#2563eb"}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = "#3b82f6"}
                        onClick={() => reenviarEmail(venda.Cliente.id)}
                      >
                        Reenviar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}