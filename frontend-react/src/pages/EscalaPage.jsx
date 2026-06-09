import { useEffect, useState } from "react"
import { api } from "../lib/api"

export default function EscalaPage() {

  const [funcionarios, setFuncionarios] = useState([])
  const [resultado, setResultado] = useState([])

  const [escala, setEscala] = useState("5x2")
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(new Date().getFullYear())

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ]

  useEffect(() => {
    fetchFuncionarios()
  }, [])

  async function fetchFuncionarios() {
    try {
      const { data } = await api.get("/funcionarios")
      setFuncionarios(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      alert("Erro ao carregar funcionários")
    }
  }

  function gerarEscala() {

    const diasMes = new Date(ano, mes, 0).getDate()

    const escalaGerada = funcionarios.map((funcionario, indice) => {

      const agenda = []

      for (let dia = 1; dia <= diasMes; dia++) {

        let trabalha = true

        switch (escala) {

          case "5x2":
            trabalha = ((dia + indice) % 7) < 5
            break

          case "6x1":
            trabalha = ((dia + indice) % 7) < 6
            break

          case "12x36":
            trabalha = ((dia + indice) % 2) === 0
            break

          default:
            trabalha = true
        }

        agenda.push(trabalha ? "T" : "F")
      }

      return {
        nome: funcionario.nome,
        cargo: funcionario.cargo,
        agenda
      }
    })

    setResultado(escalaGerada)
  }

  function limpar() {
    setResultado([])
  }

  function imprimir() {
    window.print()
  }

  return (
    <div className="grid">

      <section
        className="card"
        style={{ gridColumn: "span 12" }}
      >

        <h1
          style={{
            marginTop: 0,
            marginBottom: 5
          }}
        >
          Gerador de Escalas
        </h1>

        <p
          className="muted"
          style={{ marginBottom: 25 }}
        >
          Gere escalas automáticas para toda a equipe.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "20px"
          }}
        >

          <div>
            <label>Escala</label>

            <select
              value={escala}
              onChange={(e) => setEscala(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="5x2">5x2</option>
              <option value="6x1">6x1</option>
              <option value="12x36">12x36</option>
            </select>
          </div>

          <div>
            <label>Mês</label>

            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              style={{ width: "100%" }}
            >
              {meses.map((m, index) => (
                <option
                  key={index}
                  value={index + 1}
                >
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Ano</label>

            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "end"
            }}
          >
            <button
              className="primary"
              style={{ width: "100%" }}
              onClick={gerarEscala}
            >
              Gerar Escala
            </button>
          </div>

        </div>

      </section>

      <section
        className="card"
        style={{ gridColumn: "span 12" }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20
          }}
        >

          <div>

            <h2 style={{ margin: 0 }}>
              Escala de {meses[mes - 1]} / {ano}
            </h2>

            <p className="muted">
              Funcionários cadastrados: {funcionarios.length}
            </p>

          </div>

          <div className="toolbar">

            <button
              className="ghost"
              onClick={limpar}
            >
              Limpar
            </button>

            <button
              className="primary"
              onClick={imprimir}
            >
              Imprimir / PDF
            </button>

          </div>

        </div>

        <div
          style={{
            marginBottom: 15,
            display: "flex",
            gap: "15px"
          }}
        >

          <span style={{ color: "#22c55e" }}>
            ● T = Trabalho
          </span>

          <span style={{ color: "#ef4444" }}>
            ● F = Folga
          </span>

        </div>

        {resultado.length === 0 ? (

          <div
            className="muted"
            style={{
              padding: "30px",
              textAlign: "center"
            }}
          >
            Clique em "Gerar Escala".
          </div>

        ) : (

          <div
            style={{
              overflowX: "auto"
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1200px"
              }}
            >

              <thead>

                <tr>

                  <th
                    style={{
                      padding: 10,
                      border: "1px solid #374151"
                    }}
                  >
                    Funcionário
                  </th>

                  {resultado[0].agenda.map((_, i) => (

                    <th
                      key={i}
                      style={{
                        padding: 10,
                        border: "1px solid #374151"
                      }}
                    >
                      {i + 1}
                    </th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {resultado.map((funcionario, index) => (

                  <tr key={index}>

                    <td
                      style={{
                        padding: 10,
                        border: "1px solid #374151",
                        fontWeight: "bold"
                      }}
                    >
                      {funcionario.nome}
                    </td>

                    {funcionario.agenda.map((status, idx) => (

                      <td
                        key={idx}
                        style={{
                          textAlign: "center",
                          padding: 8,
                          border: "1px solid #374151",
                          color:
                            status === "T"
                              ? "#22c55e"
                              : "#ef4444",
                          fontWeight: "bold"
                        }}
                      >
                        {status}
                      </td>

                    ))}

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  )
}