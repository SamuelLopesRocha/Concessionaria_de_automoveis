import { useEffect, useState } from "react";

export default function SimuladorPage() {
  const [carros, setCarros] = useState([]);
  const [placa, setPlaca] = useState("");
  const [desconto, setDesconto] = useState("");
  const [entrada, setEntrada] = useState("");
  const [juros, setJuros] = useState("");
  const [parcelas, setParcelas] = useState("");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://127.0.0.1:5002";

  useEffect(() => {
    buscarCarros();
  }, []);

  async function buscarCarros() {
    try {
      const response = await fetch(`${API_URL}/carros`);
      const data = await response.json();
      setCarros(data);
    } catch (error) {
      console.error("Erro ao buscar carros:", error);
      setErro("Não foi possível carregar os carros.");
    }
  }

  async function handleSimular(e) {
    e.preventDefault();
    setErro("");
    setResultado(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/simulador`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placa,
          desconto: Number(desconto) || 0,
          entrada: Number(entrada) || 0,
          juros: Number(juros) || 0,
          parcelas: Number(parcelas) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || "Erro ao simular.");
        return;
      }

      setResultado(data);
    } catch (error) {
      console.error("Erro ao simular:", error);
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  const carroSelecionado = carros.find((carro) => carro.placa === placa);

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>Simulador de Negociação</h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>Dados do carro</h2>

          <label style={styles.label}>Selecione o carro</label>
          <select
            value={placa}
            onChange={(e) => setPlaca(e.target.value)}
            style={styles.input}
          >
            <option value="">Selecione</option>
            {carros.map((carro) => (
              <option key={carro.placa} value={carro.placa}>
                {carro.marca} {carro.modelo} - {carro.placa}
              </option>
            ))}
          </select>

          {carroSelecionado && (
            <div style={styles.infoBox}>
              <p><strong>Marca:</strong> {carroSelecionado.marca}</p>
              <p><strong>Modelo:</strong> {carroSelecionado.modelo}</p>
              <p><strong>Ano:</strong> {carroSelecionado.ano}</p>
              <p><strong>KM:</strong> {carroSelecionado.km}</p>
              <p><strong>Valor original:</strong> {formatarMoeda(carroSelecionado.valor)}</p>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2>Simulação</h2>

          <form onSubmit={handleSimular}>
            <label style={styles.label}>Desconto</label>
            <input
              type="number"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              style={styles.input}
              placeholder="Ex: 2000"
            />

            <label style={styles.label}>Entrada</label>
            <input
              type="number"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              style={styles.input}
              placeholder="Ex: 10000"
            />

            <label style={styles.label}>Juros (%)</label>
            <input
              type="number"
              value={juros}
              onChange={(e) => setJuros(e.target.value)}
              style={styles.input}
              placeholder="Ex: 8"
            />

            <label style={styles.label}>Parcelas</label>
            <input
              type="number"
              value={parcelas}
              onChange={(e) => setParcelas(e.target.value)}
              style={styles.input}
              placeholder="Ex: 12"
            />

            <button type="submit" style={styles.botao} disabled={loading}>
              {loading ? "Simulando..." : "Simular"}
            </button>
          </form>

          {erro && <p style={styles.erro}>{erro}</p>}
        </div>
      </div>

      {resultado && (
        <div style={styles.resultadoCard}>
          <h2>Resultado da simulação</h2>
          <p><strong>Valor original:</strong> {formatarMoeda(resultado.valor_original)}</p>
          <p><strong>Valor com desconto:</strong> {formatarMoeda(resultado.valor_com_desconto)}</p>
          <p><strong>Saldo financiado:</strong> {formatarMoeda(resultado.saldo_financiado)}</p>
          <p><strong>Valor total:</strong> {formatarMoeda(resultado.valor_total)}</p>
          <p><strong>Valor da parcela:</strong> {formatarMoeda(resultado.valor_parcela)}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "24px",
  },
  titulo: {
    marginBottom: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  card: {
    background: "#373875",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  resultadoCard: {
    marginTop: "24px",
    background: "#352b2b",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  label: {
    display: "block",
    marginTop: "12px",
    marginBottom: "6px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #130e0e",
  },
  botao: {
    marginTop: "18px",
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#1d4ed8",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  erro: {
    color: "red",
    marginTop: "12px",
  },
  infoBox: {
    marginTop: "16px",
    padding: "12px",
    borderRadius: "8px",
    background: "#5c73b4",
  },
};