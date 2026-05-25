import { useEffect, useMemo, useState } from "react"
import { api } from "../lib/api"
import logo from "../assets/logo.svg"

export default function SeguroPage() {

  const [carros, setCarros] = useState([])

  const [form, setForm] = useState({
    carro: "",
    idade: "",
    cnh: "",
    uso: "pessoal"
  })

  useEffect(() => {
    fetchCarros()
  }, [])

  async function fetchCarros() {
    try {

      const { data } = await api.get("/carros")

      setCarros(Array.isArray(data) ? data : [])

    } catch (err) {

      console.error(err)
      setCarros([])
    }
  }

  const carroSelecionado = useMemo(() => {

    return carros.find(
      c => c.placa === form.carro
    )

  }, [form.carro, carros])

  const resultado = useMemo(() => {

    if (!carroSelecionado) {
      return {
        mensal: 0,
        anual: 0,
        risco: "BAIXO"
      }
    }

    const preco =
      Number(carroSelecionado.preco) ||
      Number(carroSelecionado.valor) ||
      50000

    let seguro = preco * 0.04

    const idade = Number(form.idade)
    const cnh = Number(form.cnh)

    if (idade < 25) {
      seguro *= 1.2
    }

    if (idade > 50) {
      seguro *= 1.1
    }

    if (cnh < 2) {
      seguro *= 1.15
    }

    if (form.uso === "trabalho") {
      seguro *= 1.1
    }

    if (form.uso === "aplicativo") {
      seguro *= 1.25
    }

    let risco = "BAIXO"

    if (seguro > 4000) {
      risco = "ALTO"
    } else if (seguro > 2500) {
      risco = "MÉDIO"
    }

    return {
      mensal: seguro / 12,
      anual: seguro,
      risco
    }

  }, [form, carroSelecionado])

  function riscoStyle() {

    if (resultado.risco === "ALTO") {
      return {
        backgroundColor: "#7f1d1d",
        color: "#fecaca"
      }
    }

    if (resultado.risco === "MÉDIO") {
      return {
        backgroundColor: "#78350f",
        color: "#fde68a"
      }
    }

    return {
      backgroundColor: "#14532d",
      color: "#bbf7d0"
    }
  }

  const styles = {

    container: {
      padding: "20px",
      backgroundColor: "#111827",
      minHeight: "100vh",
      fontFamily: "sans-serif",
      color: "white"
    },

    header: {
      display: "flex",
      alignItems: "center",
      marginBottom: "30px"
    },

    logo: {
      width: 60,
      marginRight: "15px"
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px"
    },

    card: {
      backgroundColor: "#1f2937",
      border: "1px solid #374151",
      borderRadius: "12px",
      padding: "20px"
    },

    group: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginBottom: "18px"
    },

    label: {
      color: "#9ca3af",
      fontSize: ".9rem"
    },

    input: {
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #374151",
      backgroundColor: "#111827",
      color: "white",
      outline: "none"
    },

    kpiGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "15px",
      marginTop: "20px"
    },

    kpiCard: {
      backgroundColor: "#111827",
      border: "1px solid #374151",
      borderRadius: "12px",
      padding: "20px"
    },

    kpiTitle: {
      color: "#9ca3af",
      marginBottom: "10px"
    },

    kpiValue: {
      fontSize: "2rem",
      fontWeight: "bold"
    },

    risco: {
      marginTop: "20px",
      padding: "14px",
      borderRadius: "999px",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "1rem"
    },

    carroCard: {
      backgroundColor: "#111827",
      border: "1px solid #374151",
      borderRadius: "12px",
      padding: "20px",
      marginTop: "20px"
    },

    carroTitle: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      marginBottom: "10px"
    },

    carroInfo: {
      color: "#9ca3af",
      marginBottom: "6px"
    }
  }

  return (

    <div style={styles.container}>

      <header style={styles.header}>
        <img src={logo} alt="Logo" style={styles.logo} />

        <div>
          <h1 style={{ margin: 0 }}>
            Simulador de Seguro
          </h1>

          <span style={{ color: "#9ca3af" }}>
            Simule o valor estimado do seguro do veículo
          </span>
        </div>
      </header>

      <div style={styles.grid}>

        {/* FORMULÁRIO */}
        <section style={styles.card}>

          <h2 style={{ marginBottom: "25px" }}>
            Dados da Simulação
          </h2>

          <div style={styles.group}>

            <label style={styles.label}>
              Veículo
            </label>

            <select
              style={styles.input}
              value={form.carro}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  carro: e.target.value
                }))
              }
            >

              <option value="">
                Selecione um carro
              </option>

              {carros.map(c => (

                <option
                  key={c.placa}
                  value={c.placa}
                >
                  {c.marca} {c.modelo} — {c.placa}
                </option>

              ))}

            </select>

          </div>

          <div style={styles.group}>

            <label style={styles.label}>
              Idade do Condutor
            </label>

            <input
              type="number"
              style={styles.input}
              value={form.idade}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  idade: e.target.value
                }))
              }
              placeholder="Digite sua idade"
            />

          </div>

          <div style={styles.group}>

            <label style={styles.label}>
              Tempo de CNH
            </label>

            <input
              type="number"
              style={styles.input}
              value={form.cnh}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  cnh: e.target.value
                }))
              }
              placeholder="Anos de habilitação"
            />

          </div>

          <div style={styles.group}>

            <label style={styles.label}>
              Uso do Veículo
            </label>

            <select
              style={styles.input}
              value={form.uso}
              onChange={e =>
                setForm(f => ({
                  ...f,
                  uso: e.target.value
                }))
              }
            >

              <option value="pessoal">
                Pessoal
              </option>

              <option value="trabalho">
                Trabalho
              </option>

              <option value="aplicativo">
                Aplicativo
              </option>

            </select>

          </div>

        </section>

        {/* RESULTADOS */}
        <section style={styles.card}>

          <h2>
            Resultado da Simulação
          </h2>

          <div style={styles.kpiGrid}>

            <div style={styles.kpiCard}>

              <div style={styles.kpiTitle}>
                Seguro Mensal
              </div>

              <div style={styles.kpiValue}>
                R$ {resultado.mensal.toFixed(2)}
              </div>

            </div>

            <div style={styles.kpiCard}>

              <div style={styles.kpiTitle}>
                Seguro Anual
              </div>

              <div style={styles.kpiValue}>
                R$ {resultado.anual.toFixed(2)}
              </div>

            </div>

          </div>

          <div
            style={{
              ...styles.risco,
              ...riscoStyle()
            }}
          >
            RISCO {resultado.risco}
          </div>

          {carroSelecionado && (

            <div style={styles.carroCard}>

              <div style={styles.carroTitle}>
                {carroSelecionado.marca} {carroSelecionado.modelo}
              </div>

              <div style={styles.carroInfo}>
                Placa: {carroSelecionado.placa}
              </div>

              <div style={styles.carroInfo}>
                Ano: {carroSelecionado.ano}
              </div>

              <div style={styles.carroInfo}>
                Valor:
                {" "}
                R$ {
                  Number(
                    carroSelecionado.preco ||
                    carroSelecionado.valor ||
                    0
                  ).toFixed(2)
                }
              </div>

            </div>

          )}

        </section>

      </div>

    </div>
  )
}