from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    HRFlowable,
    Image,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT


class NotaFiscalGenerator:
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.base_dir = Path(__file__).resolve().parent.parent
        self.styles = getSampleStyleSheet()
        self._configurar_estilos()

    def _configurar_estilos(self):
        self.title_style = ParagraphStyle(
            "TitleCenter",
            parent=self.styles["Title"],
            alignment=TA_CENTER,
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            textColor=colors.black,
            spaceAfter=2,
        )

        self.subtitle_style = ParagraphStyle(
            "SubtitleCenter",
            parent=self.styles["Normal"],
            alignment=TA_CENTER,
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=colors.black,
            spaceAfter=2,
        )

        self.box_title_style = ParagraphStyle(
            "BoxTitle",
            parent=self.styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=9,
            textColor=colors.black,
        )

        self.normal_small = ParagraphStyle(
            "NormalSmall",
            parent=self.styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=9,
            textColor=colors.black,
        )

        self.normal_tiny = ParagraphStyle(
            "NormalTiny",
            parent=self.styles["Normal"],
            fontName="Helvetica",
            fontSize=7,
            leading=8,
            textColor=colors.black,
        )

        self.bold_small = ParagraphStyle(
            "BoldSmall",
            parent=self.styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=9,
            textColor=colors.black,
        )

        self.total_style = ParagraphStyle(
            "TotalStyle",
            parent=self.styles["Normal"],
            alignment=TA_RIGHT,
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=14,
            textColor=colors.black,
        )

        self.footer_style = ParagraphStyle(
            "FooterStyle",
            parent=self.styles["Normal"],
            alignment=TA_CENTER,
            fontName="Helvetica-Oblique",
            fontSize=7,
            leading=8,
            textColor=colors.HexColor("#4B5563"),
        )

        self.assinatura_style = ParagraphStyle(
            "AssinaturaStyle",
            parent=self.styles["Normal"],
            alignment=TA_CENTER,
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            textColor=colors.black,
        )

        self.recebimento_style = ParagraphStyle(
            "RecebimentoStyle",
            parent=self.styles["Normal"],
            alignment=TA_LEFT,
            fontName="Helvetica",
            fontSize=7,
            leading=8,
            textColor=colors.black,
        )

    def _formatar_moeda(self, valor):
        return f"R$ {float(valor):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

    def _formatar_data(self, data):
        if hasattr(data, "strftime"):
            return data.strftime("%d/%m/%Y")
        return str(data)

    def _gerar_numero_documento(self, venda_id):
        return str(venda_id).zfill(9)

    def _gerar_serie(self):
        return "001"

    def _gerar_chave_acesso(self, venda_id):
        base = f"3526{str(venda_id).zfill(40)}"
        return " ".join([base[i:i + 4] for i in range(0, len(base), 4)])

    def _buscar_logo(self):
        caminhos = [
            self.base_dir / "assets" / "logo.png",
            self.base_dir / "assets" / "logo.jpg",
            self.base_dir / "assets" / "logo.jpeg",
            self.base_dir / "assets" / "logo.webp",
        ]
        for caminho in caminhos:
            if caminho.exists():
                return caminho
        return None

    def gerar_pdf(self, venda_data: dict) -> Path:
        nome_arquivo = f'nota_fiscal_{venda_data["venda_id"]}.pdf'
        pdf_path = self.output_dir / nome_arquivo

        doc = SimpleDocTemplate(
            str(pdf_path),
            pagesize=A4,
            rightMargin=1.0 * cm,
            leftMargin=1.0 * cm,
            topMargin=0.8 * cm,
            bottomMargin=0.8 * cm,
        )

        elementos = []

        numero_nf = self._gerar_numero_documento(venda_data["venda_id"])
        serie_nf = self._gerar_serie()
        chave_acesso = self._gerar_chave_acesso(venda_data["venda_id"])
        data_emissao = self._formatar_data(venda_data["data_venda"])
        total_compra = self._formatar_moeda(venda_data["valor_total"])

        # BLOCO DE RECEBIMENTO
        recebemos_texto = (
            f"RECEBEMOS DE PLUTO CONCESSIONÁRIA OS PRODUTOS/SERVIÇOS CONSTANTES "
            f"DESTA NOTA FISCAL FICTÍCIA INDICADA AO LADO. DESTINATÁRIO: {venda_data['cliente_nome'].upper()} "
            f" | VALOR TOTAL: {total_compra}"
        )

        recebimento = Table([
            [
                Paragraph(recebemos_texto, self.recebimento_style),
                Paragraph(
                    f"NF-e<br/><b>Nº {numero_nf}</b><br/>SÉRIE {serie_nf}",
                    self.bold_small
                )
            ],
            [
                Paragraph("DATA DE RECEBIMENTO", self.normal_tiny),
                Paragraph("IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR", self.normal_tiny),
            ]
        ], colWidths=[15.5 * cm, 3.8 * cm])

        recebimento.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("GRID", (0, 0), (-1, -1), 0.8, colors.black),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (1, 1), "CENTER"),
        ]))
        elementos.append(recebimento)
        elementos.append(Spacer(1, 0.15 * cm))
        elementos.append(HRFlowable(width="100%", thickness=1, color=colors.black))
        elementos.append(Spacer(1, 0.15 * cm))

        # LOGO + CABEÇALHO
        logo_path = self._buscar_logo()
        if logo_path:
            logo = Image(str(logo_path), width=2.2 * cm, height=2.2 * cm)
        else:
            logo = Paragraph("PLUTO", self.bold_small)

        emitente_info = Table([
            [Paragraph("PLUTO CONCESSIONÁRIA", self.title_style)],
            [Paragraph("Comércio de Veículos Automotores", self.subtitle_style)],
            [Paragraph("Avenida Comercial das Estrelas, 1000", self.normal_small)],
            [Paragraph("São Paulo - SP | CEP 01000-000", self.normal_small)],
            [Paragraph("CNPJ: 00.000.000/0001-00 | IE: 123.456.789.000", self.normal_small)],
            [Paragraph("Telefone: (11) 4000-0000", self.normal_small)],
        ], colWidths=[6.0 * cm])
        emitente_info.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))

        emitente_box = Table([[logo, emitente_info]], colWidths=[2.8 * cm, 6.1 * cm])
        emitente_box.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (0, 0), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))

        danfe_box = Table([
            [Paragraph("DANFE", self.title_style)],
            [Paragraph("Documento Auxiliar da", self.normal_tiny)],
            [Paragraph("Nota Fiscal Eletrônica", self.normal_tiny)],
            [Paragraph("0 - Entrada    1 - Saída", self.normal_small)],
            [Paragraph("1", self.bold_small)],
            [Paragraph(f"Nº {numero_nf}", self.bold_small)],
            [Paragraph(f"SÉRIE {serie_nf}", self.bold_small)],
        ], colWidths=[3.6 * cm])
        danfe_box.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))

        acesso_box = Table([
            [Paragraph("CHAVE DE ACESSO", self.box_title_style)],
            [Paragraph(chave_acesso, self.normal_small)],
            [Paragraph("Consulta de autenticidade em ambiente fictício", self.normal_tiny)],
            [Paragraph("USO EXCLUSIVO EM AMBIENTE DEMONSTRATIVO", self.bold_small)],
        ], colWidths=[6.7 * cm])
        acesso_box.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))

        topo = Table([[emitente_box, danfe_box, acesso_box]], colWidths=[9.0 * cm, 3.7 * cm, 6.7 * cm])
        topo.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        elementos.append(topo)
        elementos.append(Spacer(1, 0.15 * cm))

        # NATUREZA / PROTOCOLO
        natureza = Table([
            [
                Paragraph("NATUREZA DA OPERAÇÃO", self.normal_tiny),
                Paragraph("PROTOCOLO DE AUTORIZAÇÃO DE USO", self.normal_tiny),
            ],
            [
                Paragraph("Venda de veículo", self.normal_small),
                Paragraph("Documento fictício - sem validade fiscal", self.normal_small),
            ]
        ], colWidths=[10.0 * cm, 9.0 * cm])
        natureza.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("GRID", (0, 0), (-1, -1), 0.8, colors.black),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elementos.append(natureza)
        elementos.append(Spacer(1, 0.15 * cm))

        # DESTINATÁRIO
        elementos.append(Paragraph("DESTINATÁRIO / REMETENTE", self.box_title_style))

        destinatario = Table([
            [
                Paragraph("NOME / RAZÃO SOCIAL", self.normal_tiny),
                Paragraph("CPF", self.normal_tiny),
                Paragraph("DATA DE EMISSÃO", self.normal_tiny),
            ],
            [
                Paragraph(venda_data["cliente_nome"], self.normal_small),
                Paragraph(venda_data["cliente_cpf"] or "-", self.normal_small),
                Paragraph(data_emissao, self.normal_small),
            ],
            [
                Paragraph("E-MAIL", self.normal_tiny),
                Paragraph("TELEFONE", self.normal_tiny),
                Paragraph("UF", self.normal_tiny),
            ],
            [
                Paragraph(venda_data["cliente_email"], self.normal_small),
                Paragraph(venda_data["cliente_telefone"] or "-", self.normal_small),
                Paragraph("SP", self.normal_small),
            ],
        ], colWidths=[10.0 * cm, 4.8 * cm, 4.2 * cm])
        destinatario.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("GRID", (0, 0), (-1, -1), 0.8, colors.black),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]))
        elementos.append(destinatario)
        elementos.append(Spacer(1, 0.15 * cm))

        # CÁLCULO DO IMPOSTO
        elementos.append(Paragraph("CÁLCULO DO IMPOSTO", self.box_title_style))

        impostos = Table([
            [
                Paragraph("BASE DE CÁLCULO ICMS", self.normal_tiny),
                Paragraph("VALOR DO ICMS", self.normal_tiny),
                Paragraph("BASE CÁLC. ICMS ST", self.normal_tiny),
                Paragraph("VALOR DO ICMS ST", self.normal_tiny),
                Paragraph("VALOR TOTAL DOS PRODUTOS", self.normal_tiny),
            ],
            [
                Paragraph("R$ 0,00", self.normal_small),
                Paragraph("R$ 0,00", self.normal_small),
                Paragraph("R$ 0,00", self.normal_small),
                Paragraph("R$ 0,00", self.normal_small),
                Paragraph(total_compra, self.normal_small),
            ],
            [
                Paragraph("VALOR DO FRETE", self.normal_tiny),
                Paragraph("VALOR DO SEGURO", self.normal_tiny),
                Paragraph("DESCONTO", self.normal_tiny),
                Paragraph("OUTRAS DESPESAS", self.normal_tiny),
                Paragraph("VALOR TOTAL DA NOTA", self.normal_tiny),
            ],
            [
                Paragraph("R$ 0,00", self.normal_small),
                Paragraph("R$ 0,00", self.normal_small),
                Paragraph("R$ 0,00", self.normal_small),
                Paragraph("R$ 0,00", self.normal_small),
                Paragraph(total_compra, self.bold_small),
            ],
        ], colWidths=[3.8 * cm, 3.6 * cm, 3.8 * cm, 3.6 * cm, 4.2 * cm])
        impostos.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("GRID", (0, 0), (-1, -1), 0.8, colors.black),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        elementos.append(impostos)
        elementos.append(Spacer(1, 0.15 * cm))

        # PRODUTOS
        elementos.append(Paragraph("DADOS DOS PRODUTOS / SERVIÇOS", self.box_title_style))

        tabela_dados = [[
            Paragraph("CÓD.", self.normal_tiny),
            Paragraph("DESCRIÇÃO DOS PRODUTOS / SERVIÇOS", self.normal_tiny),
            Paragraph("QTD.", self.normal_tiny),
            Paragraph("VLR. UNIT.", self.normal_tiny),
            Paragraph("VLR. TOTAL", self.normal_tiny),
        ]]

        for i, item in enumerate(venda_data["itens"], start=1):
            tabela_dados.append([
                Paragraph(str(i).zfill(3), self.normal_small),
                Paragraph(item["descricao"], self.normal_small),
                Paragraph(str(item["quantidade"]), self.normal_small),
                Paragraph(self._formatar_moeda(item["valor_unitario"]), self.normal_small),
                Paragraph(self._formatar_moeda(item["valor_total"]), self.normal_small),
            ])

        produtos = Table(
            tabela_dados,
            colWidths=[1.5 * cm, 10.3 * cm, 1.8 * cm, 2.8 * cm, 2.9 * cm]
        )
        produtos.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("GRID", (0, 0), (-1, -1), 0.8, colors.black),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (2, 1), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elementos.append(produtos)
        elementos.append(Spacer(1, 0.15 * cm))

        # PAGAMENTO
        pagamento = Table([
            [
                Paragraph("FORMA DE PAGAMENTO", self.normal_tiny),
                Paragraph("DATA/HORA DE GERAÇÃO", self.normal_tiny),
                Paragraph("NÚMERO DA VENDA", self.normal_tiny),
            ],
            [
                Paragraph(str(venda_data["forma_pagamento"]), self.normal_small),
                Paragraph(datetime.now().strftime("%d/%m/%Y %H:%M"), self.normal_small),
                Paragraph(str(venda_data["venda_id"]), self.normal_small),
            ],
        ], colWidths=[7.0 * cm, 6.0 * cm, 6.0 * cm])
        pagamento.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("GRID", (0, 0), (-1, -1), 0.8, colors.black),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        elementos.append(pagamento)
        elementos.append(Spacer(1, 0.15 * cm))

        # DADOS ADICIONAIS
        elementos.append(Paragraph("DADOS ADICIONAIS", self.box_title_style))
        adicionais = Table([
            [Paragraph(
                "INFORMAÇÕES COMPLEMENTARES: Documento fictício gerado automaticamente para fins acadêmicos, "
                "de demonstração de automação de processos e envio de documentação ao cliente. "
                "Este arquivo não possui validade fiscal, tributária ou contábil perante órgãos oficiais.",
                self.normal_small
            )]
        ], colWidths=[19.0 * cm])
        adicionais.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 1, colors.black),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        elementos.append(adicionais)
        elementos.append(Spacer(1, 0.2 * cm))

        # TOTAL
        elementos.append(Paragraph(f"VALOR TOTAL DA NOTA: {total_compra}", self.total_style))
        elementos.append(Spacer(1, 0.45 * cm))

        # ASSINATURAS
        assinaturas = Table([
            [
                Paragraph("__________________________________", self.assinatura_style),
                Paragraph("__________________________________", self.assinatura_style),
            ],
            [
                Paragraph("Responsável pela Emissão", self.assinatura_style),
                Paragraph("Cliente / Recebedor", self.assinatura_style),
            ]
        ], colWidths=[9.5 * cm, 9.5 * cm])
        assinaturas.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elementos.append(assinaturas)
        elementos.append(Spacer(1, 0.1 * cm))

        # RODAPÉ
        elementos.append(HRFlowable(width="100%", thickness=0.8, color=colors.black))
        elementos.append(Spacer(1, 0.08 * cm))
        elementos.append(Paragraph(
            "DANFE FICTÍCIA • USO EXCLUSIVO PARA DEMONSTRAÇÃO • PLUTO CONCESSIONÁRIA",
            self.footer_style
        ))

        doc.build(elementos)
        return pdf_path