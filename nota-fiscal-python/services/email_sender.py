import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication


class EmailSender:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.smtp_from = os.getenv("SMTP_FROM")

    def enviar_nota_fiscal(self, destinatario: str, nome_cliente: str, pdf_path, venda_id: int):
        msg = MIMEMultipart()
        msg["From"] = self.smtp_from
        msg["To"] = destinatario
        msg["Subject"] = f"Comprovante de Compra - Venda #{venda_id}"

        corpo = f"""
Olá, {nome_cliente}!

Segue em anexo a sua nota fiscal fictícia referente à compra realizada em nossa concessionária.

Agradecemos pela preferência.

Atenciosamente,
Pluto Concessionária
        """.strip()

        msg.attach(MIMEText(corpo, "plain", "utf-8"))

        with open(pdf_path, "rb") as f:
            anexo = MIMEApplication(f.read(), _subtype="pdf")
            anexo.add_header("Content-Disposition", "attachment", filename=pdf_path.name)
            msg.attach(anexo)

        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)