import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )


def get_venda_data(venda_id: int):
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        query = """
            SELECT
                v.id AS venda_id,
                v.data_venda,
                v.valor_venda AS valor_total,
                v.forma_pgto AS forma_pagamento,

                c.nome AS cliente_nome,
                c.email AS cliente_email,
                c.cpf AS cliente_cpf,
                c.telefone AS cliente_telefone,

                ca.marca,
                ca.modelo,
                ca.ano,
                ca.placa,
                ca.valor AS valor_unitario

            FROM vendas v
            JOIN clientes c ON c.id = v.cliente_id
            JOIN carros ca ON ca.placa = v.carro_id
            WHERE v.id = %s
        """

        cursor.execute(query, (venda_id,))
        venda = cursor.fetchone()

        if not venda:
            return None

        return {
            "venda_id": venda["venda_id"],
            "data_venda": venda["data_venda"],
            "valor_total": venda["valor_total"],
            "forma_pagamento": venda["forma_pagamento"],
            "cliente_nome": venda["cliente_nome"],
            "cliente_email": venda["cliente_email"],
            "cliente_cpf": venda["cliente_cpf"],
            "cliente_telefone": venda["cliente_telefone"],
            "itens": [
                {
                    "descricao": f'{venda["marca"]} {venda["modelo"]} {venda["ano"]} - Placa {venda["placa"]}',
                    "quantidade": 1,
                    "valor_unitario": venda["valor_unitario"],
                    "valor_total": venda["valor_total"]
                }
            ]
        }

    finally:
        if conn:
            conn.close()