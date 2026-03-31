import sys
from pathlib import Path
from unittest.mock import MagicMock
import pytest

# Garante que o Python encontre o app.py na raiz do projeto nota-fiscal-python
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_gerar_nota_fiscal_com_sucesso(monkeypatch, client):
    # STUB: simula retorno do banco
    venda_fake = {
        "venda_id": 2,
        "data_venda": "2026-03-24",
        "valor_total": 85000,
        "forma_pagamento": "Pix",
        "cliente_nome": "Tiago",
        "cliente_email": "tiago@email.com",
        "cliente_cpf": "123.456.789-00",
        "cliente_telefone": "(11)99999-9999",
        "itens": [
            {
                "descricao": "Veículo Fiat Argo 2022 - Placa ABC1234",
                "quantidade": 1,
                "valor_unitario": 85000,
                "valor_total": 85000,
            }
        ],
    }

    def fake_get_venda_data(venda_id):
        return venda_fake

    # FAKE/MOCK: evita gerar PDF real
    class FakeNotaFiscalGenerator:
        def __init__(self, output_dir):
            self.output_dir = output_dir

        def gerar_pdf(self, venda_data):
            return Path("output/nota_fiscal_2.pdf")

    # MOCK: registra se o envio de email foi chamado
    email_mock = MagicMock()

    class FakeEmailSender:
        def enviar_nota_fiscal(self, destinatario, nome_cliente, pdf_path, venda_id):
            email_mock(destinatario, nome_cliente, pdf_path, venda_id)

    # Substitui dependências reais pelos doubles
    monkeypatch.setattr("app.get_venda_data", fake_get_venda_data)
    monkeypatch.setattr("app.NotaFiscalGenerator", FakeNotaFiscalGenerator)
    monkeypatch.setattr("app.EmailSender", FakeEmailSender)

    response = client.post("/gerar-nota-fiscal?venda_id=2")
    data = response.get_json()

    assert response.status_code == 200
    assert data["status"] == "ok"
    assert data["pdf"] == "nota_fiscal_2.pdf"
    assert data["sent_to"] == "tiago@email.com"

    email_mock.assert_called_once_with(
        "tiago@email.com",
        "Tiago",
        Path("output/nota_fiscal_2.pdf"),
        2
    )


def test_gerar_nota_fiscal_quando_venda_nao_existe(monkeypatch, client):
    def fake_get_venda_data(venda_id):
        return None

    monkeypatch.setattr("app.get_venda_data", fake_get_venda_data)

    response = client.post("/gerar-nota-fiscal?venda_id=999")
    data = response.get_json()

    assert response.status_code == 404
    assert data["error"] == "Venda não encontrada"


def test_gerar_nota_fiscal_sem_venda_id(client):
    response = client.post("/gerar-nota-fiscal")
    data = response.get_json()

    assert response.status_code == 400
    assert data["error"] == "Parâmetro venda_id é obrigatório"