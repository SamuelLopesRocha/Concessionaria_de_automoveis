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
DB_HOST = "db.mbpgssybkzbklyywjuwt.supabase.co"
DB_DATABASE = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "faculdadeimpacta"
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
    
@st.cache_data(ttl=600)
def get_vendas_data_from_postgres():
    """Obtém dados de vendas do banco de dados PostgreSQL hospedado no Supabase."""
    conn = None
    try:
        conn_string = f"dbname={DB_DATABASE} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"
        conn = psycopg.connect(conn_string)

        query = """
        SELECT 
            v.id,
            v.id_carro,
            v.id_funcionario,
            v.data_venda,
            v.valor_venda,
            v.comissao_vendedor,
            f.nome AS nome_vendedor,
            f.idade AS idade_vendedor
        FROM vendas v
        JOIN funcionarios f ON v.id_funcionario = f.id
        ORDER BY v.data_venda;
        """

        df = pd.read_sql(query, conn)
        return df

    except OperationalError as e:
        st.error(f"⚠️ Erro de conexão com o banco de dados: {e}")
        return pd.DataFrame()
    except Exception as e:
        st.error(f"❌ Erro ao buscar dados de vendas: {e}")
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

        # ============================================
        # 1. KPIs
        # ============================================
        col1, col2, col3 = st.columns(3)
        col1.metric("Total de Veículos", len(df_carro))
        col2.metric("Valor Total de Estoque (R$)", f"R$ {df_carro['valor'].sum():,.2f}")
        col3.metric("Preço Médio por Carro (R$)", f"R$ {df_carro['valor'].mean():,.2f}")
        st.markdown("---")

        # ============================================
        # 2. Veículos por Marca
        # ============================================
        st.subheader("📌 Veículos por Marca")

        contagem_marca = df_carro['marca'].value_counts().reset_index()
        contagem_marca.columns = ['Marca', 'Quantidade']

        fig_marca = px.bar(
            contagem_marca,
            x='Marca',
            y='Quantidade',
            title='Distribuição de Veículos por Marca',
            text='Quantidade',
            color='Quantidade',
            color_continuous_scale='tealgrn'
        )
        fig_marca.update_traces(
            marker_line_color='black',
            marker_line_width=1.2,
            textposition='outside'
        )
        fig_marca.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(size=14, color='white'),
            title_font=dict(size=20, color='white'),
            showlegend=False,
            margin=dict(l=0, r=0, t=60, b=0)
        )
        st.plotly_chart(fig_marca, use_container_width=True)
        st.markdown("---")

        # ============================================
        # 3. Distribuição de Preços dos Veículos
        # ============================================
        st.subheader("💰 Distribuição de Preços dos Veículos")

        # Ajuste de intervalos (inclui 350k e 400k corretamente)
        bins = [0, 50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 500000]
        labels = [
            "0–50K", "51–100K", "101–150K", "151–200K",
            "201–250K", "251–300K", "301–350K", "351–400K", "401K+"
        ]

        df_carro["Faixa de Preço"] = pd.cut(
            df_carro["valor"],  # usa a coluna 'valor' corretamente
            bins=bins,
            labels=labels,
            include_lowest=True,
            right=True  # garante inclusão do valor máximo
        )

        faixa_preco = (
            df_carro["Faixa de Preço"]
            .value_counts()
            .sort_index()
            .reset_index()
        )
        faixa_preco.columns = ["Faixa de Preço", "Quantidade"]

        fig_preco = px.bar(
            faixa_preco,
            x="Faixa de Preço",
            y="Quantidade",
            title="Distribuição de Preços dos Veículos",
            text="Quantidade",
            color="Quantidade",
            color_continuous_scale="tealgrn"
        )
        fig_preco.update_traces(
            marker_line_color="black",
            marker_line_width=1.2,
            textposition="outside"
        )
        fig_preco.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(size=14, color="white"),
            title_font=dict(size=20, color="white"),
            showlegend=False,
            margin=dict(l=0, r=0, t=60, b=0)
        )
        st.plotly_chart(fig_preco, use_container_width=True)
        st.markdown("---")

        # ============================================
        # 4. Idade Média dos Carros por Marca
        # ============================================
        st.subheader("🕒 Idade Média dos Carros por Marca")

        df_carro['idade'] = datetime.now().year - df_carro['ano']
        idade_media = df_carro.groupby('marca')['idade'].mean().reset_index()

        fig_idade = px.bar(
            idade_media,
            x='marca',
            y='idade',
            title='Idade Média dos Carros por Marca (em anos)',
            text=idade_media['idade'].round(1),
            color='idade',
            color_continuous_scale='tealgrn'
        )
        fig_idade.update_traces(
            marker_line_color='black',
            marker_line_width=1.2,
            texttemplate='%{text:.1f}',
            textposition='outside'
        )
        fig_idade.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(size=14, color='white'),
            title_font=dict(size=20, color='white'),
            showlegend=False,
            margin=dict(l=0, r=0, t=60, b=0),
            xaxis_title="Marca",
            yaxis_title="Idade Média (anos)"
        )
        st.plotly_chart(fig_idade, use_container_width=True)
        st.markdown("---")

        # ============================================
        # 5. Tabela Bruta
        # ============================================
        st.subheader("📋 Dados dos Veículos")
        st.dataframe(df_carro, use_container_width=True, height=400)

    else:
        st.warning("⚠️ Estoque vazio ou erro na consulta. Verifique o banco de dados.")

# --------------------------------------------------------------------------
# VENDAS
# --------------------------------------------------------------------------
elif dashboard_selecionado == "Vendas":
    st.subheader("💰 Dashboard de Vendas")

    @st.cache_data(ttl=600)
    def get_vendas_data_from_postgres():
        """Obtém dados de vendas do banco."""
        conn = None
        try:
            conn_string = f"dbname={DB_DATABASE} user={DB_USER} password={DB_PASSWORD} host={DB_HOST} port={DB_PORT}"
            conn = psycopg.connect(conn_string)

            query = """
            SELECT 
                v.id,
                v.id_carro,
                v.id_funcionario,
                v.data_venda,
                v.valor_venda,
                v.comissao_vendedor,
                f.nome AS nome_vendedor,
                f.idade AS idade_vendedor
            FROM vendas v
            JOIN funcionarios f ON v.id_funcionario = f.id;
            """
            df = pd.read_sql(query, conn)
            return df

        except Exception as e:
            st.error(f"❌ Erro ao carregar vendas: {e}")
            return pd.DataFrame()
        finally:
            if conn:
                conn.close()

    df_vendas = get_vendas_data_from_postgres()

    if not df_vendas.empty:
        st.success(f"✅ {len(df_vendas)} vendas carregadas com sucesso em {datetime.now().strftime('%H:%M:%S')}")
        st.markdown("---")

        # KPIs
        total_vendas = len(df_vendas)
        receita_total = df_vendas["valor_venda"].sum()
        comissao_total = df_vendas["comissao_vendedor"].sum()
        comissao_media = df_vendas["comissao_vendedor"].mean()

        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Total de Vendas", total_vendas)
        col2.metric("Receita Total", f"R$ {receita_total:,.2f}")
        col3.metric("Comissão Total", f"R$ {comissao_total:,.2f}")
        col4.metric("Comissão Média", f"R$ {comissao_media:,.2f}")
        st.markdown("---")

        # 1. Vendas por Vendedor
        st.subheader("📊 Vendas por Vendedor")
        vendas_vendedor = df_vendas["nome_vendedor"].value_counts().reset_index()
        vendas_vendedor.columns = ["Vendedor", "Quantidade"]

        fig_vendas_vendedor = px.bar(
            vendas_vendedor,
            x="Vendedor",
            y="Quantidade",
            title="Quantidade de Vendas por Vendedor",
            text="Quantidade",
            color="Quantidade",
            color_continuous_scale="tealgrn"
        )
        fig_vendas_vendedor.update_traces(marker_line_color="black", marker_line_width=1.2, textposition="outside")
        fig_vendas_vendedor.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(size=14, color="white"),
            title_font=dict(size=20, color="white"),
            showlegend=False
        )
        st.plotly_chart(fig_vendas_vendedor, use_container_width=True)
        st.markdown("---")

        # 2. Idade Média dos Vendedores em Vendas
        st.subheader("📅 Idade Média dos Vendedores em Vendas")

        idade_media_vendas = df_vendas.groupby("nome_vendedor")["idade_vendedor"].mean().reset_index()
        idade_media_vendas.columns = ["Vendedor", "Idade Média"]

        fig_idade_vendas = px.bar(
            idade_media_vendas,
            x="Vendedor",
            y="Idade Média",
            title="Idade Média dos Vendedores Envolvidos nas Vendas",
            text=idade_media_vendas["Idade Média"].round(1),
            color="Idade Média",
            color_continuous_scale="tealgrn"
        )
        fig_idade_vendas.update_traces(marker_line_color="black", marker_line_width=1.2, texttemplate="%{text:.1f}", textposition="outside")
        fig_idade_vendas.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(size=14, color="white"),
            title_font=dict(size=20, color="white"),
            showlegend=False
        )
        st.plotly_chart(fig_idade_vendas, use_container_width=True)
        st.markdown("---")

        # 3. Comissão Total por Vendedor
        st.subheader("💸 Comissão Total por Vendedor")

        comissao_vendedor = df_vendas.groupby("nome_vendedor")["comissao_vendedor"].sum().reset_index()
        comissao_vendedor.columns = ["Vendedor", "Comissão Total"]

        fig_comissao = px.bar(
            comissao_vendedor,
            x="Vendedor",
            y="Comissão Total",
            title="Total de Comissão Recebida por Vendedor (R$)",
            text="Comissão Total",
            color="Comissão Total",
            color_continuous_scale="tealgrn"
        )
        fig_comissao.update_traces(
            marker_line_color="black",
            marker_line_width=1.2,
            texttemplate="R$ %{text:,.2f}",
            textposition="outside"
        )
        fig_comissao.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(size=14, color="white"),
            title_font=dict(size=20, color="white"),
            showlegend=False
        )
        st.plotly_chart(fig_comissao, use_container_width=True)
        st.markdown("---")

        
        # ============================================
        # Gráfico combinado: Vendas x Idade (simplificado)
        # ============================================
        st.subheader("📊 Vendas por Vendedor com Idade")

        import plotly.graph_objects as go

        # Agrupa vendas por vendedor e pega a idade
        vendas_idade = df_vendas.groupby(["nome_vendedor", "idade_vendedor"]).size().reset_index(name="Quantidade de Vendas")

        fig_comb = go.Figure()

        # Adiciona as barras de vendas
        fig_comb.add_trace(go.Bar(
            x=vendas_idade["nome_vendedor"],
            y=vendas_idade["Quantidade de Vendas"],
            name="Número de Vendas",
            marker_color="teal",
            text=vendas_idade["Quantidade de Vendas"],
            textposition="inside",  # quantidade centralizada dentro da barra
            textfont=dict(color="white", size=14)
        ))

        # Adiciona bolhas de idade sobre as barras, agora com linha conectando
        fig_comb.add_trace(go.Scatter(
            x=vendas_idade["nome_vendedor"],
            y=vendas_idade["Quantidade de Vendas"] + 0.5,  # posiciona a bolha acima da barra
            mode="lines+markers+text",  # ADICIONA A LINHA
            text=vendas_idade["idade_vendedor"],
            textposition="top center",
            marker=dict(
                size=20, 
                color="orange", 
                opacity=0.8, 
                line=dict(width=1, color="black")
            ),
            line=dict(color="orange", width=2),  # define cor e espessura da linha
            showlegend=False
        ))


        fig_comb.update_layout(
            title="Vendas por Vendedor com Idade (bolhas indicam idade)",
            xaxis_title="Vendedor",
            yaxis_title="Número de Vendas",
            yaxis=dict(showgrid=True, zeroline=True),
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(color="white", size=14),
            margin=dict(l=20, r=20, t=60, b=20)
        )

        st.plotly_chart(fig_comb, use_container_width=True)


        # 5. Dados Brutos
        st.subheader("📋 Dados de Vendas")
        st.dataframe(df_vendas, use_container_width=True, height=400)
        
    else:
        st.warning("⚠️ Nenhuma venda encontrada ou erro na consulta ao banco.")
# --------------------------------------------------------------------------
# FUNCIONÁRIOS
# -------------------------------------------------------------------------
elif dashboard_selecionado == "Funcionários":
    st.subheader("👥 Dashboard de Funcionários")

    df_func = get_funcionarios_data_from_postgres()

    if not df_func.empty:
        st.success(f"✅ Dados de {len(df_func)} funcionários carregados.")
        st.markdown("---")

        # ============================================
        # 1. Funcionários por Cargo
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
            color='Quantidade',
            color_continuous_scale='tealgrn'
        )
        fig_cargo.update_traces(
            marker_line_color='black',
            marker_line_width=1.2,
            textposition='outside'
        )
        fig_cargo.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',   # fundo do gráfico transparente
            paper_bgcolor='rgba(0,0,0,0)',  # fundo fora do gráfico transparente
            font=dict(size=14, color='white'),
            title_font=dict(size=20, color='white'),
            showlegend=False,
            margin=dict(l=0, r=0, t=60, b=0)
        )
        st.plotly_chart(fig_cargo, use_container_width=True)
        st.markdown("---")

        # ============================================
        # 2. Faixa Etária (Gráfico Horizontal)
        # ============================================
        st.subheader("🎂 Distribuição de Idade dos Funcionários")

        bins = [18, 25, 30, 35, 40, 45, 50, 60, 70]
        labels = ["18–25", "26–30", "31–35", "36–40", "41–45", "46–50", "51–60", "61–70"]
        df_func["Faixa Etária"] = pd.cut(df_func["idade"], bins=bins, labels=labels, include_lowest=True)

        faixa_counts = df_func["Faixa Etária"].value_counts().sort_index().reset_index()
        faixa_counts.columns = ["Faixa Etária", "Quantidade"]

        fig_idade = px.bar(
            faixa_counts,
            x="Quantidade",
            y="Faixa Etária",
            orientation="h",
            title="Distribuição de Funcionários por Faixa Etária",
            text="Quantidade",
            color="Quantidade",
            color_continuous_scale="tealgrn"
        )
        fig_idade.update_traces(
            marker_line_color="black",
            marker_line_width=1.2,
            textposition="outside"
        )
        fig_idade.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(size=14, color='white'),
            title_font=dict(size=20, color='white'),
            showlegend=False,
            margin=dict(l=0, r=0, t=60, b=0)
        )
        st.plotly_chart(fig_idade, use_container_width=True)
        st.markdown("---")

        # ============================================
        # 3. Idade Média por Cargo
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
            color='Idade Média',
            color_continuous_scale='tealgrn'
        )
        fig_idade_cargo.update_traces(
            marker_line_color='black',
            marker_line_width=1.2,
            texttemplate='%{text:.1f}',
            textposition='outside'
        )
        fig_idade_cargo.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            font=dict(size=14, color='white'),
            title_font=dict(size=20, color='white'),
            showlegend=False,
            margin=dict(l=0, r=0, t=60, b=0)
        )
        st.plotly_chart(fig_idade_cargo, use_container_width=True)
        st.markdown("---")

        # ============================================
        # 4. Tabela Bruta
        # ============================================
        st.subheader("📋 Dados dos Funcionários")
        st.dataframe(df_func, use_container_width=True, height=400)

    else:
        st.warning("⚠️ Nenhum dado encontrado ou erro na consulta. Verifique o banco de dados.")

# --------------------------------------------------------------------------
# COMPARATIVO
# --------------------------------------------------------------------------
elif dashboard_selecionado == "Comparativo":
    st.subheader("📈 Comparativo de Estatísticas")
    
    # Obtem dados de carros e vendas
    df_carro = get_carro_data_from_postgres()
    df_vendas = get_vendas_data_from_postgres()
    
    if df_carro.empty or df_vendas.empty:
        st.warning("⚠️ Não há dados suficientes para comparar. Verifique carros e vendas.")
    else:
        # =========================================================
        # 1. KPIs Principais
        # =========================================================
        total_compras = df_carro['valor'].sum()   # total gasto na compra dos carros
        total_vendas = df_vendas['valor_venda'].sum()  # total obtido com vendas
        lucro = total_vendas - total_compras
        
        # Indicador de lucro x despesas
        cor_lucro = "normal" if lucro >= 0 else "inverse"
        
        # Meta de vendas
        meta_vendas = max(27, len(df_vendas) + 2)  # meta coerente: maior que vendas atuais
        total_vendas_realizadas = len(df_vendas)
        cor_meta = "normal" if total_vendas_realizadas >= meta_vendas else "inverse"
        
        # Estoque x vendas
        estoque_atual = len(df_carro)
        carros_vendidos = len(df_vendas)
        cor_estoque = "normal" if estoque_atual == 45 and carros_vendidos == 29 else "inverse"
        
        # Cria colunas para KPIs
        col1, col2, col3 = st.columns(3)
        col1.metric("💰 Lucro/Prejuízo", f"R$ {lucro:,.2f}", delta=f"R$ {lucro:,.2f}", delta_color=cor_lucro)
        col2.metric(f"🎯 Meta de Vendas ({meta_vendas})", total_vendas_realizadas, delta_color=cor_meta)
        col3.metric("🚗 Estoque x Vendas", f"{estoque_atual} carros / {carros_vendidos} vendidos", delta_color=cor_estoque)
        st.markdown("---")
        
        # =========================================================
        # 2. Gráfico Lucro x Despesa
        # =========================================================
        df_financeiro = pd.DataFrame({
            "Categoria": ["Compras (Despesas)", "Vendas (Receita)"],
            "Valor (R$)": [total_compras, total_vendas]
        })
        
        fig_fin = px.bar(
            df_financeiro,
            x="Categoria",
            y="Valor (R$)",
            text="Valor (R$)",
            color="Categoria",
            color_discrete_map={"Compras (Despesas)": "red", "Vendas (Receita)": "green"},
            title="💹 Comparativo: Lucro x Despesas"
        )
        fig_fin.update_traces(texttemplate="R$ %{text:,.2f}", textposition="outside")
        fig_fin.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(size=14, color="white"),
            title_font=dict(size=20, color="white"),
            showlegend=False,
            margin=dict(l=0, r=0, t=60, b=0)
        )
        st.plotly_chart(fig_fin, use_container_width=True)
        st.markdown("---")
        
        # =========================================================
        # 3. Meta de Vendas por Funcionário
        # =========================================================
        st.subheader("📊 Meta de Vendas por Vendedor")
        vendas_por_vendedor = df_vendas.groupby("nome_vendedor")["id"].count().reset_index()
        vendas_por_vendedor.columns = ["Vendedor", "Quantidade de Vendas"]
        
        fig_vendas_meta = px.bar(
            vendas_por_vendedor,
            x="Vendedor",
            y="Quantidade de Vendas",
            text="Quantidade de Vendas",
            title=f"Vendas por Vendedor vs Meta ({meta_vendas})",
        )
        fig_vendas_meta.add_hline(
            y=meta_vendas, line_dash="dash", line_color="yellow",
            annotation_text="Meta", annotation_position="top right"
        )
        fig_vendas_meta.update_traces(textposition="inside", marker_color="teal")
        fig_vendas_meta.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(size=14, color="white"),
            title_font=dict(size=20, color="white")
        )
        st.plotly_chart(fig_vendas_meta, use_container_width=True)
        st.markdown("---")
        
        # =========================================================
        # 4. Estoque x Vendas x Prejuízo
        # =========================================================
        st.subheader("📦 Estoque x Vendas")
        df_estoque = pd.DataFrame({
            "Categoria": ["Estoque Atual", "Carros Vendidos", "Compras (R$)", "Receita Vendas (R$)"],
            "Valor": [estoque_atual, carros_vendidos, total_compras, total_vendas]
        })
        fig_estoque = px.bar(
            df_estoque,
            x="Categoria",
            y="Valor",
            text="Valor",
            color="Categoria",
            title="Comparativo de Estoque, Vendas e Prejuízo"
        )
        fig_estoque.update_traces(textposition="outside")
        fig_estoque.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(size=14, color="white"),
            title_font=dict(size=20, color="white")
        )
        st.plotly_chart(fig_estoque, use_container_width=True)
        
        # =========================================================
        # 5. Observações
        # =========================================================
        st.markdown("**Observações:**")
        if lucro < 0:
            st.warning("⚠️ A concessionária está no prejuízo! Reavalie os preços ou reduza despesas.")
        else:
            st.success("✅ A concessionária está lucrando.")
        
        if total_vendas_realizadas < meta_vendas:
            st.warning(f"⚠️ Meta de vendas não atingida ({total_vendas_realizadas}/{meta_vendas}).")
        else:
            st.success(f"🎯 Meta de vendas atingida ({total_vendas_realizadas}/{meta_vendas})!")
        
        if estoque_atual != 45:
            st.warning(f"⚠️ Estoque não está completo. Total de carros: {estoque_atual}.")
