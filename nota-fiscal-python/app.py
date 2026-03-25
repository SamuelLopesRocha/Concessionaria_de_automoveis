from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pathlib import Path
import traceback

from services.database import get_venda_data
from services.nota_fiscal import NotaFiscalGenerator
from services.email_sender import EmailSender

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)


@app.route("/gerar-nota-fiscal", methods=["POST"])
def gerar_nota_fiscal():
    try:
        venda_id = request.args.get("venda_id", type=int)

        if not venda_id:
            return jsonify({"error": "Parâmetro venda_id é obrigatório"}), 400

        venda_data = get_venda_data(venda_id)

        if not venda_data:
            return jsonify({"error": "Venda não encontrada"}), 404

        generator = NotaFiscalGenerator(output_dir=OUTPUT_DIR)
        pdf_path = generator.gerar_pdf(venda_data)

        email_sender = EmailSender()
        email_sender.enviar_nota_fiscal(
            destinatario=venda_data["cliente_email"],
            nome_cliente=venda_data["cliente_nome"],
            pdf_path=pdf_path,
            venda_id=venda_id
        )

        return jsonify({
            "status": "ok",
            "pdf": pdf_path.name,
            "sent_to": venda_data["cliente_email"]
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "error": "Erro interno ao gerar nota fiscal",
            "details": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)