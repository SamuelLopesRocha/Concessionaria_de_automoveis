from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT


class NotaFiscalGenerator:
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.styles = getSampleStyleSheet()
        self._configurar_estilos()

    def _configurar_estilos(self):
        self.title_style = ParagraphStyle(
            "TitleCenter",
            parent=self.styles["Title"],
            alignment=TA_CENTER,
            fontSize=16,
            spaceAfter=12
        )

        self.right_style = ParagraphStyle(
            "RightAlign",
            parent=self.styles["Normal"],
            alignment=TA_RIGHT
        )

    def _formatar_moeda(self, valor):
        return f"R$ {float(valor):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

    def gerar_pdf(self, venda_data: dict) -> Path:
        nome_arquivo = f'nota_fiscal_{venda_data["venda_id"]}.pdf'
        pdf_path = self.output_dir / nome_arquivo

        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2 * cm,
            bottomMargin=2 * cm
        )

        elementos = []

        elementos.append(Paragraph("PLUTO CONCESSIONÁRIA", self.title_style))
        elementos.append(Paragraph("NOTA FISCAL FICTÍCIA", self.title_style))
        elementos.append(Spacer(1, 0.5 * cm))

        elementos.append(Paragraph(f"Número da Venda: {venda_data['venda_id']}", self.styles["Normal"]))
        elementos.append(Paragraph(
            f"Data de Emissão: {venda_data['data_venda'].strftime('%d/%m/%Y') if hasattr(venda_data['data_venda'], 'strftime') else venda_data['data_venda']}",
            self.styles["Normal"]
        ))
        elementos.append(Spacer(1, 0.5 * cm))

        elementos.append(Paragraph("<b>Dados do Cliente</b>", self.styles["Heading3"]))
        elementos.append(Paragraph(f"Nome: {venda_data['cliente_nome']}", self.styles["Normal"]))
        elementos.append(Paragraph(f"CPF: {venda_data['cliente_cpf'] or '-'}", self.styles["Normal"]))
        elementos.append(Paragraph(f"E-mail: {venda_data['cliente_email']}", self.styles["Normal"]))
        elementos.append(Paragraph(f"Telefone: {venda_data['cliente_telefone'] or '-'}", self.styles["Normal"]))
        elementos.append(Spacer(1, 0.5 * cm))

        elementos.append(Paragraph("<b>Itens da Venda</b>", self.styles["Heading3"]))

        tabela_dados = [["Descrição", "Qtd", "Valor Unit.", "Valor Total"]]

        for item in venda_data["itens"]:
            tabela_dados.append([
                item["descricao"],
                str(item["quantidade"]),
                self._formatar_moeda(item["valor_unitario"]),
                self._formatar_moeda(item["valor_total"])
            ])

        tabela = Table(tabela_dados, colWidths=[8 * cm, 2 * cm, 3 * cm, 3 * cm])
        tabela.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("ALIGN", (1, 1), (-1, -1), "CENTER"),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ]))

        elementos.append(tabela)
        elementos.append(Spacer(1, 0.5 * cm))

        elementos.append(Paragraph(
            f"<b>Forma de Pagamento:</b> {venda_data['forma_pagamento']}",
            self.styles["Normal"]
        ))
        elementos.append(Spacer(1, 0.3 * cm))
        elementos.append(Paragraph(
            f"<b>Total da Compra:</b> {self._formatar_moeda(venda_data['valor_total'])}",
            self.right_style
        ))

        elementos.append(Spacer(1, 1 * cm))
        elementos.append(Paragraph(
            "Documento gerado automaticamente para fins demonstrativos.",
            self.styles["Italic"]
        ))

        doc.build(elementos)
        return pdf_path