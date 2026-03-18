import { useEffect, useState } from "react"
import { api } from "../lib/api"
import logo from "../assets/logo.svg"

export default function EnvioDocumentos() {
  const [vendas, setVendas] = useState([])
  const [filtroDocumento, setFiltroDocumento] = useState("todos")
  const [enviandoId, setEnviandoId] = useState(null)

  useEffect(() => {
    fetchVendas()
  }, [])

  const fetchVendas = async () => {
    try {
      const { data } = await api.get("/vendas/")
      setVendas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Erro ao buscar vendas:", err)
      alert("Erro ao buscar vendas. Confira o backend.")
    }
  }

  const emailValido = (venda) => {
    return venda.Cliente?.status_email === "VERIFICADO"
  }

  const statusDocumento = (venda) => {
    if (!emailValido(venda)) return "EMAIL INVÁLIDO"
    return "DISPONÍVEL"
  }

  const getStatusStyle = (status) => {
    if (status === "DISPONÍVEL") {
      return { ...styles.status, backgroundColor: "#22c55e", color: "white" }
    }
    if (status === "DEMONSTRATIVO") {
      return { ...styles.status, backgroundColor: "#facc15", color: "#111827" }
    }
    return { ...styles.status, backgroundColor: "#ef4444", color: "white" }
  }

  const handleEnviarDocumento = async (venda, tipoDocumento) => {
    const nomeCliente = venda.Cliente?.nome || "Cliente"
    const emailCliente = venda.Cliente?.email || ""
    const vendaId = venda.id

    if (!emailValido(venda)) {
      alert(`O cliente ${nomeCliente} não possui e-mail verificado.`)
      return
    }

    if (tipoDocumento !== "nota_fiscal") {
      alert(`"${formatarNomeDocumento(tipoDocumento)}" é apenas demonstrativo no momento.`)
      return
    }

    const confirmacao = window.confirm(
      `Deseja enviar a Nota Fiscal para ${nomeCliente} (${emailCliente})?`
    )
    if (!confirmacao) return

    try {
      setEnviandoId(vendaId)

      const response = await fetch(
        `http://127.0.0.1:5001/gerar-nota-fiscal?venda_id=${vendaId}`,
        { method: "POST" }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || data?.details || "Erro ao enviar documento")
      }

      alert(`Nota Fiscal enviada com sucesso para ${data.sent_to}`)
    } catch (err) {
      console.error("Erro ao enviar documento:", err)
      alert(`Erro ao enviar documento: ${err.message}`)
    } finally {
      setEnviandoId(null)
    }
  }

  const formatarNomeDocumento = (tipo) => {
    const nomes = {
      nota_fiscal: "Nota Fiscal",
      contrato_compra: "Contrato de Compra",
      recibo_pagamento: "Recibo de Pagamento",
      comprovante_entrega: "Comprovante de Entrega",
    }
    return nomes[tipo] || tipo
  }

  const documentosDisponiveis = [
    { value: "nota_fiscal", label: "Nota Fiscal", ativo: true },
    { value: "contrato_compra", label: "Contrato de Compra", ativo: false },
    { value: "recibo_pagamento", label: "Recibo de Pagamento", ativo: false },
    { value: "comprovante_entrega", label: "Comprovante de Entrega", ativo: false },
  ]

  const vendasFiltradas = vendas.filter(() => true)

  const total = vendas.length
  const comEmailValido = vendas.filter((v) => emailValido(v)).length
  const semEmailValido = vendas.filter((v) => !emailValido(v)).length
  const docsAtivos = documentosDisponiveis.filter((d) => d.ativo).length

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <h1>Central de Envio de Documentos</h1>
      </header>

      <div style={styles.docSummary}>
        <div style={styles.summaryCard}>
          <span>Total de Vendas</span><br />
          <strong>{total}</strong>
        </div>
        <div style={{ ...styles.summaryCard, ...styles.summaryGreen }}>
          <span>Clientes com E-mail Verificado</span><br />
          <strong>{comEmailValido}</strong>
        </div>
        <div style={{ ...styles.summaryCard, ...styles.summaryRed }}>
          <span>Clientes sem E-mail Verificado</span><br />
          <strong>{semEmailValido}</strong>
        </div>
        <div style={{ ...styles.summaryCard, ...styles.summaryBlue }}>
          <span>Documentos Ativos</span><br />
          <strong>{docsAtivos}</strong>
        </div>
      </div>

      <section style={styles.card}>
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Filtrar documento</label>
            <select
              value={filtroDocumento}
              onChange={(e) => setFiltroDocumento(e.target.value)}
              style={styles.select}
            >
              <option value="todos">Todos</option>
              {documentosDisponiveis.map((doc) => (
                <option key={doc.value} value={doc.value}>
                  {doc.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>E-mail</th>
                <th style={styles.th}>Data da Venda</th>
                <th style={styles.th}>Status do E-mail</th>
                <th style={styles.th}>Documento</th>
                <th style={styles.th}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.map((venda) => {
                const clienteNome = venda.Cliente?.nome || "(Sem nome)"
                const clienteEmail = venda.Cliente?.email || "-"
                const emailOk = emailValido(venda)

                const documentoSelecionado =
                  filtroDocumento === "todos" ? "nota_fiscal" : filtroDocumento

                const statusDoc =
                  documentoSelecionado === "nota_fiscal"
                    ? statusDocumento(venda)
                    : "DEMONSTRATIVO"

                return (
                  <tr
                    key={venda.id}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={styles.td}>{clienteNome}</td>
                    <td style={styles.td}>{clienteEmail}</td>
                    <td style={styles.td}>{venda.data_venda}</td>
                    <td style={styles.td}>
                      <span
                        style={
                          emailOk
                            ? { ...styles.status, backgroundColor: "#22c55e", color: "white" }
                            : { ...styles.status, backgroundColor: "#ef4444", color: "white" }
                        }
                      >
                        {emailOk ? "VERIFICADO" : "NÃO VERIFICADO"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(statusDoc)}>
                        {formatarNomeDocumento(documentoSelecionado)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={{
                          ...styles.btn,
                          ...(enviandoId === venda.id ? styles.btnDisabled : {}),
                        }}
                        disabled={enviandoId === venda.id}
                        onMouseOver={(e) => {
                          if (enviandoId !== venda.id) e.currentTarget.style.backgroundColor = "#2563eb"
                        }}
                        onMouseOut={(e) => {
                          if (enviandoId !== venda.id) e.currentTarget.style.backgroundColor = "#3b82f6"
                        }}
                        onClick={() => handleEnviarDocumento(venda, documentoSelecionado)}
                      >
                        {enviandoId === venda.id ? "Enviando..." : "Enviar"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#111827",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "30px",
    color: "white",
  },
  logo: {
    width: 60,
    marginRight: "15px",
  },
  docSummary: {
    display: "flex",
    gap: "15px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  summaryCard: {
    flex: 1,
    minWidth: "180px",
    backgroundColor: "#1f2937",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    color: "white",
  },
  summaryGreen: {
    backgroundColor: "#22c55e",
  },
  summaryRed: {
    backgroundColor: "#ef4444",
  },
  summaryBlue: {
    backgroundColor: "#3b82f6",
  },
  card: {
    backgroundColor: "#1f2937",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    color: "white",
  },
  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: "15px",
    flexWrap: "wrap",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    minWidth: "250px",
  },
  label: {
    marginBottom: "8px",
    color: "#d1d5db",
    fontWeight: "bold",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #374151",
    backgroundColor: "#111827",
    color: "white",
    outline: "none",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #374151",
    color: "#d1d5db",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #374151",
    color: "#e5e7eb",
  },
  btn: {
    padding: "6px 12px",
    borderRadius: "6px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  btnDisabled: {
    backgroundColor: "#6b7280",
    cursor: "not-allowed",
  },
  status: {
    padding: "4px 8px",
    borderRadius: "4px",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: "0.75rem",
    display: "inline-block",
  },
}