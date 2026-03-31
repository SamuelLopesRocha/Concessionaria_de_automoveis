import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def enviar_email(destinatario, assunto, texto, html):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", smtp_user)

    if not smtp_server or not smtp_user or not smtp_password:
        raise Exception("Variáveis SMTP não configuradas no .env")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = assunto
    msg["From"] = smtp_from
    msg["To"] = destinatario

    part1 = MIMEText(texto, "plain", "utf-8")
    part2 = MIMEText(html, "html", "utf-8")

    msg.attach(part1)
    msg.attach(part2)

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_from, destinatario, msg.as_string())