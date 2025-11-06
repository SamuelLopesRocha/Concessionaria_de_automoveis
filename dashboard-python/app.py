# app.py
import streamlit as st
import pandas as pd
import psycopg
from psycopg import OperationalError
import plotly.express as px
from datetime import datetime

# ==============================================================================
# 1. CONFIGURAÇÃO E CREDENCIAIS
# ==============================================================================

st.set_page_config(layout="wide")
st.title("📊 Dashboard de Estoque e Performance da Concessionária")
st.markdown("---")

# ATENÇÃO: Se a senha ou host mudarem, ajuste APENAS aqui.
DB_HOST = "db.lbyvnjpkbqnvgeulddxg.supabase.co"
DB_DATABASE = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "kHnc7evFFcP5HZ8j"  # << SUA SENHA ESTÁ AQUI
DB_PORT = "5432"

# ==============================================================================
# 2. FUNÇÃO DE CARGA DE DADOS
# ==============================================================================

# O cache evita que a consulta ao BD seja refeita a cada clique/interação
@st.cache_data(ttl=600)
def get_carro_data_from_postgres():
    conn = None 
    try:
        # Conexão
        conn_string = f"dbname={DB_DATABASE} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"
        conn = psycopg.connect(conn_string)
        
        # Consulta SQL focada em CARROS (Estoque)
        # ATENÇÃO: Ajustei 'id' para 'carro_id' e 'valor' para 'preco' 
        # para tentar corrigir os erros de coluna do PostgreSQL.
        query = """
        SELECT 
            placa,  
            marca, 
            modelo, 
            ano, 
            cor, 
            valor,  
            km
        FROM carros  
        ORDER BY marca, modelo;
        """
        
        # Executa a consulta e armazena em DataFrame
        df = pd.read_sql(query, conn)
        
        return df
    
    except OperationalError as e:
        st.error(f"⚠️ Erro de Conexão: Verifique as credenciais ou o status do Supabase. Detalhe: {e}")
        return pd.DataFrame()
    except Exception as e:
        # Este erro pegará o erro de coluna, como o anterior
        st.error(f"❌ Erro ao buscar dados: {e}") 
        return pd.DataFrame()
    finally:
        if conn:
            conn.close() 

# ==============================================================================
# 3. LAYOUT DO DASHBOARD
# ==============================================================================

df_carro = get_carro_data_from_postgres()

if not df_carro.empty:
    st.success(f"Estoque de Carros carregado com sucesso em {datetime.now().strftime('%H:%M:%S')}. Total de {len(df_carro)} veículos.")
    st.markdown("---")

    # 1. KPIs (Métricas Chave)
    col1, col2, col3 = st.columns(3)
    
    # KPI 1: Total em Estoque
    col1.metric(label="Total de Veículos no Estoque", value=len(df_carro))
    
    # KPI 2: Valor Total do Estoque (usando a coluna 'valor' renomeada)
    valor_total = df_carro['valor'].sum()
    col2.metric(label="Valor Total de Estoque (R$)", value=f"R$ {valor_total:,.2f}")

    # KPI 3: Preço Médio
    preco_medio = df_carro['valor'].mean()
    col3.metric(label="Preço Médio por Carro (R$)", value=f"R$ {preco_medio:,.2f}")

    st.markdown("---")

    # 2. Gráfico: Distribuição por Marca (Conforme as Estatísticas Detalhadas que você deseja)
    st.subheader("Distribuição de Veículos por Marca")
    contagem_marca = df_carro['marca'].value_counts().reset_index()
    contagem_marca.columns = ['Marca', 'Contagem']

    fig = px.pie(
        contagem_marca, 
        values='Contagem', 
        names='Marca', 
        title='Percentual de Carros no Estoque',
        hole=.3
    )
    st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")
    
    # 3. Dados Brutos
    st.subheader("Dados Brutos do Estoque")
    st.dataframe(df_carro)

else:
    # Mensagem exibida em caso de erro na conexão ou na consulta
    st.info("Não foi possível carregar dados da tabela 'carros'. Verifique os erros acima e o nome das colunas.")