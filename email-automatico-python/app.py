from flask import Flask, request, jsonify
from dotenv import load_dotenv
from pathlib import Path
import traceback

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")  # força ler o .env certo

from email_sender import enviar_email  # depois do load_dotenv

app = Flask(__name__)


def montar_email_html(nome: str, link_verificacao: str) -> str:
    return f"""
<!doctype html>
<html lang="pt-br">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Verificação de e-mail</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.08);">
            <tr>
              <td style="background:#111827;padding:18px 24px;">
                <div style="color:#fff;font-size:16px;font-weight:700;">Pluto Concessionária</div>
                <div style="color:#cbd5e1;font-size:12px;margin-top:4px;">Confirmação de e-mail</div>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 24px;color:#111827;">
                <div style="font-size:18px;font-weight:700;">Olá, {nome} 👋</div>
                <div style="margin-top:10px;font-size:14px;line-height:1.6;color:#334155;">
                  Para concluir a verificação do seu e-mail, clique no botão abaixo:
                </div>

                <div style="margin:22px 0;text-align:center;">
                  <a href="{link_verificacao}"
                     style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;
                            padding:12px 18px;border-radius:10px;font-weight:700;font-size:14px;">
                    Verificar e-mail
                  </a>
                </div>

                <div style="font-size:12px;line-height:1.6;color:#64748b;">
                  Se você não solicitou isso, pode ignorar esta mensagem com segurança.
                  <br/>
                  Este link expira por segurança.
                </div>

                <div style="margin-top:18px;padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;">
                  <div style="font-size:12px;color:#475569;margin-bottom:6px;">Se o botão não funcionar, copie e cole este link no navegador:</div>
                  <div style="font-size:12px;color:#0f172a;word-break:break-all;">{link_verificacao}</div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px;background:#f8fafc;color:#64748b;font-size:12px;">
                © 2026 Pluto Concessionária • Este é um e-mail automático, não responda.
              </td>
            </tr>
          </table>

          <div style="width:600px;margin-top:10px;color:#94a3b8;font-size:11px;text-align:center;">
            Dica: adicione este remetente aos seus contatos para evitar que o e-mail vá para spam.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
""".strip()


def montar_email_texto(nome: str, link_verificacao: str) -> str:
    return (
        f"Olá, {nome}!\n\n"
        "Para confirmar seu e-mail, acesse o link abaixo:\n"
        f"{link_verificacao}\n\n"
        "Se você não solicitou isso, ignore esta mensagem.\n"
        "— Pluto Concessionária"
    )


@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.post("/send-email")
def send_email():
    try:
        body = request.get_json(silent=True) or {}

        cliente_id = body.get("cliente_id")
        nome = (body.get("nome") or "").strip()
        email = (body.get("email") or "").strip()
        link_verificacao = (body.get("link_verificacao") or "").strip()

        # validações
        if not cliente_id:
            return jsonify({"error": "cliente_id ausente"}), 400
        if not nome:
            return jsonify({"error": "nome ausente"}), 400
        if not email or ("@" not in email) or ("." not in email):
            return jsonify({"error": f"email inválido: {email}"}), 400
        if not link_verificacao.startswith("http"):
            return jsonify({"error": "link_verificacao ausente ou inválido"}), 400

        assunto = "Verificação de E-mail • Pluto Concessionária"
        html = montar_email_html(nome, link_verificacao)
        texto = montar_email_texto(nome, link_verificacao)

        # ✅ agora envia HTML + texto
        enviar_email(destinatario=email, assunto=assunto, texto=texto, html=html)

        return jsonify({"status": "ok"}), 200

    except Exception as e:
        print("❌ ERRO NO /send-email")
        traceback.print_exc()
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)