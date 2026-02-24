import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def enviar_email(destinatario: str, assunto: str, texto: str, html: str) -> None:
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM") or smtp_user

    if not smtp_user or not smtp_password:
        raise RuntimeError("SMTP_USER ou SMTP_PASSWORD não configurados no .env")

    msg = MIMEMultipart("alternative")
    msg["From"] = smtp_from
    msg["To"] = destinatario
    msg["Subject"] = assunto

    # Texto puro + HTML
    msg.attach(MIMEText(texto, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_from, [destinatario], msg.as_string())