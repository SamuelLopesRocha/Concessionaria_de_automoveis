import { useEffect, useMemo, useState } from "react"
import { api } from "../lib/api"
import logo from "../assets/logo.svg"

export default function ComissaoPage() {

  const [vendas, setVendas] = useState([])
  const [funcionarioId, setFuncionarioId] = useState("")

  useEffect(() => {
    fetchVendas()
  }, [])

  async function fetchVendas() {

    try {

      const { data } = await api.get("/vendas/")

      setVendas(Array.isArray(data) ? data : [])

    } catch (err) {

      console.error(err)

      alert("Erro ao buscar vendas")
    }
  }

  // FUNCIONÁRIOS ÚNICOS
  const funcionarios = useMemo(() => {

    const mapa = new Map()

    vendas.forEach(v => {

      if (v.Funcionario?.id) {

        mapa.set(v.Funcionario.id, v.Funcionario)
      }
    })

    return Array.from(mapa.values())

  }, [vendas])

  // FILTRO
  const vendasFiltradas = useMemo(() => {

    if (!funcionarioId) return vendas

    return vendas.filter(
      v => String(v.Funcionario?.id) === String(funcionarioId)
    )

  }, [vendas, funcionarioId])

  // KPIs
  const totalVendido = useMemo(() => {

    return vendasFiltradas.reduce(
      (acc, v) => acc + Number(v.valor_venda || 0),
      0
    )

  }, [vendasFiltradas])

  const totalComissao = useMemo(() => {

    return vendasFiltradas.reduce(
      (acc, v) => acc + Number(v.comissao_vend || 0),
      0
    )

  }, [vendasFiltradas])

  const mediaComissao = useMemo(() => {

    if (!vendasFiltradas.length) return 0

    return totalComissao / vendasFiltradas.length

  }, [vendasFiltradas, totalComissao])

  return (

    <div className="container">

      {/* HEADER */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "30px"
        }}
      >

        <img
          src={logo}
          alt="Logo"
          style={{ width: 60 }}
        />

        <div>
          <h1 style={{ margin: 0 }}>
            Comissão de Vendedores
          </h1>

          <p className="muted">
            Controle de desempenho e comissão
          </p>
        </div>

      </header>

      {/* FILTRO */}
      <section
        className="card"
        style={{ marginBottom: "20px" }}
      >

        <h2>Filtro</h2>

        <div
          style={{
            marginTop: "15px",
            maxWidth: "350px"
          }}
        >

          <label className="muted">
            Funcionário
          </label>

          <select
            className="testdrive-input"
            value={funcionarioId}
            onChange={e => setFuncionarioId(e.target.value)}
          >

            <option value="">
              Todos os funcionários
            </option>

            {funcionarios.map(f => (

              <option
                key={f.id}
                value={f.id}
              >
                {f.nome}
              </option>

            ))}

          </select>

        </div>

      </section>

      {/* KPIs */}
      <section className="kpi">

        <div className="item">
          <div className="label">
            Total Vendido
          </div>

          <div className="value">
            R$ {totalVendido.toLocaleString("pt-BR", {
              minimumFractionDigits: 2
            })}
          </div>
        </div>

        <div className="item">
          <div className="label">
            Comissão Total
          </div>

          <div className="value">
            R$ {totalComissao.toLocaleString("pt-BR", {
              minimumFractionDigits: 2
            })}
          </div>
        </div>

        <div className="item">
          <div className="label">
            Média Comissão
          </div>

          <div className="value">
            R$ {mediaComissao.toLocaleString("pt-BR", {
              minimumFractionDigits: 2
            })}
          </div>
        </div>

      </section>

      {/* LISTA */}
      <section className="card">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >

          <h2>
            Histórico de Vendas
          </h2>

          <span className="kbd">
            {vendasFiltradas.length} venda(s)
          </span>

        </div>

        <ul
          className="list"
          style={{ marginTop: "20px" }}
        >

          {vendasFiltradas.map(v => (

            <li key={v.id}>

              <div>

                <strong>
                  {v.Funcionario?.nome || "Sem funcionário"}
                </strong>

                <br />

                <span className="muted">

                  Cliente:
                  {" "}
                  {v.Cliente?.nome || "—"}

                  {" • "}

                  Carro:
                  {" "}
                  {v.Carro?.modelo || "—"}

                  {" • "}

                  Data:
                  {" "}
                  {v.data_venda}

                </span>

              </div>

              <div
                style={{
                  textAlign: "right"
                }}
              >

                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.1rem"
                  }}
                >
                  R$ {Number(v.valor_venda || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2
                  })}
                </div>

                <div
                  style={{
                    color: "#22c55e",
                    fontWeight: "bold"
                  }}
                >
                  Comissão:
                  {" "}
                  R$ {Number(v.comissao_vend || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2
                  })}
                </div>

              </div>

            </li>

          ))}

        </ul>

      </section>

    </div>
  )
}