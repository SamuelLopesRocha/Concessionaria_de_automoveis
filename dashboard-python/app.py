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

st.set_page_config(layout="wide", page_title="Dashboard de Gestão da Concessionária")
st.title("📊 Dashboard de Gestão da Concessionária")
st.markdown("---")

# ATENÇÃO: ajuste as credenciais somente aqui, se necessário
DB_HOST = "db.lbyvnjpkbqnvgeulddxg.supabase.co"
DB_DATABASE = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "kHnc7evFFcP5HZ8j"
DB_PORT = "5432"

# ==============================================================================
# 2. FUNÇÕES DE CARGA DE DADOS
# ==============================================================================

@st.cache_data(ttl=600)
def get_carro_data_from_postgres():
    """Obtém os dados de carros (estoque) do banco de dados PostgreSQL hospedado no Supabase."""
    conn = None
    try:
        conn_string = f"dbname={DB_DATABASE} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"
        conn = psycopg.connect(conn_string)

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

        df = pd.read_sql(query, conn)
        return df

    except OperationalError as e:
        st.error(f"⚠️ Erro de conexão com o banco de dados. Detalhes: {e}")
        return pd.DataFrame()
    except Exception as e:
        st.error(f"❌ Erro ao buscar dados: {e}")
        st.info("Verifique se as colunas 'placa' e 'valor' existem na tabela 'carros'.")
        return pd.DataFrame()
    finally:
        if conn:
            conn.close()

@st.cache_data(ttl=600)
def get_funcionarios_data_from_postgres():
    """Obtém dados de funcionários (a ser implementado)."""
    conn = None
    try:
        conn_string = f"dbname={DB_DATABASE} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"
        conn = psycopg.connect(conn_string)

        query = """
        SELECT 
            id, 
            cpf, 
            nome, 
            cargo, 
            idade
        FROM funcionarios  
        ORDER BY nome, cargo;
        """

        df = pd.read_sql(query, conn)
        return df

    except OperationalError as e:
        st.error(f"⚠️ Erro de Conexão: {e}")
        return pd.DataFrame()
    finally:
        if conn:
            conn.close()

# ==============================================================================
# 3. NAVEGAÇÃO HORIZONTAL (ROTEAMENTO)
# ==============================================================================

dashboard_selecionado = st.radio(
    "Selecione o Dashboard:",
    ("Carros (Estoque)", "Vendas", "Funcionários", "Comparativo"),
    horizontal=True,
    key="main_navigation"
)

st.markdown("---")

# ==============================================================================
# 4. CONTEÚDO DOS DASHBOARDS
# ==============================================================================

# --------------------------------------------------------------------------
# CARROS (ESTOQUE)
# --------------------------------------------------------------------------
if dashboard_selecionado == "Carros (Estoque)":

    st.subheader("🚗 Dashboard de Estoque de Veículos")
    df_carro = get_carro_data_from_postgres()

    if not df_carro.empty:
        st.success(f"✅ Dados carregados com sucesso em {datetime.now().strftime('%H:%M:%S')}. Total: {len(df_carro)} veículos.")
        st.markdown("---")

        # KPIs
        col1, col2, col3 = st.columns(3)
        col1.metric("Total de Veículos", len(df_carro))
        col2.metric("Valor Total de Estoque (R$)", f"R$ {df_carro['valor'].sum():,.2f}")
        col3.metric("Preço Médio por Carro (R$)", f"R$ {df_carro['valor'].mean():,.2f}")

        st.markdown("---")

        # Gráfico de Distribuição por Marca
        st.subheader("Distribuição de Veículos por Marca")
        contagem_marca = df_carro['marca'].value_counts().reset_index()
        contagem_marca.columns = ['Marca', 'Quantidade']

        fig = px.pie(
            contagem_marca,
            values='Quantidade',
            names='Marca',
            title='Percentual de Carros no Estoque',
            hole=0.3
        )
        st.plotly_chart(fig, use_container_width=True)

        st.markdown("---")

        # Dados Brutos
        st.subheader("📋 Dados Brutos do Estoque")
        st.dataframe(df_carro, use_container_width=True)

    else:
        st.warning("⚠️ Estoque vazio ou erro na consulta. Verifique o banco de dados.")

# --------------------------------------------------------------------------
# VENDAS
# --------------------------------------------------------------------------
elif dashboard_selecionado == "Vendas":
    st.subheader("💰 Dashboard de Vendas")
    st.info("Em desenvolvimento: Esta seção exibirá receita, número de carros vendidos e ticket médio.")

# --------------------------------------------------------------------------
# FUNCIONÁRIOS
# --------------------------------------------------------------------------
elif dashboard_selecionado == "Funcionários":
    st.subheader("👥 Dashboard de Funcionários")

    df_func = get_funcionarios_data_from_postgres()

    if not df_func.empty:
        st.success(f"Dados de {len(df_func)} funcionários carregados.")
        st.markdown("---")

        # ============================================
        # 1. Coluna: Contagem por Cargo
        # ============================================
        st.subheader("📌 Funcionários por Cargo")

        contagem_cargo = df_func['cargo'].value_counts().reset_index()
        contagem_cargo.columns = ['Cargo', 'Quantidade']

        fig_cargo = px.bar(
            contagem_cargo,
            x='Cargo',
            y='Quantidade',
            title='Distribuição de Funcionários por Cargo',
            text='Quantidade',
        )
        fig_cargo.update_layout(xaxis_title="Cargo", yaxis_title="Quantidade")
        st.plotly_chart(fig_cargo, use_container_width=True)

        st.markdown("---")

        # ============================================
        # 2. Gráfico: Faixa Etária
        # ============================================
        st.subheader("🎂 Distribuição de Idade dos Funcionários")

        fig_idade = px.histogram(
            df_func,
            x='idade',
            nbins=10,
            title='Histograma de Idades',
            labels={'idade': 'Idade'},
        )
        st.plotly_chart(fig_idade, use_container_width=True)

        st.markdown("---")

        # ============================================
        # 3. Gráfico: Idade Média por Cargo
        # ============================================
        st.subheader("📊 Idade Média por Cargo")

        idade_media_por_cargo = df_func.groupby('cargo')['idade'].mean().reset_index()
        idade_media_por_cargo.columns = ['Cargo', 'Idade Média']

        fig_idade_cargo = px.bar(
            idade_media_por_cargo,
            x='Cargo',
            y='Idade Média',
            title='Idade Média por Cargo',
            text='Idade Média',
        )
        fig_idade_cargo.update_traces(texttemplate='%{text:.1f}')
        st.plotly_chart(fig_idade_cargo, use_container_width=True)

        st.markdown("---")

        # ============================================
        # 4. Tabela Bruta
        # ============================================
        st.subheader("📋 Dados dos Funcionários")
        st.dataframe(df_func, use_container_width=True)

    else:
        st.warning("Nenhum dado encontrado ou funcionalidade ainda em desenvolvimento.")

# --------------------------------------------------------------------------
# COMPARATIVO
# --------------------------------------------------------------------------
elif dashboard_selecionado == "Comparativo":
    st.subheader("📈 Comparativo de Estatísticas")
    st.info("Em desenvolvimento: esta seção permitirá comparar desempenho de vendedores ou modelos de carros.")
