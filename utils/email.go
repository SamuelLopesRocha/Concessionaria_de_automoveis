package utils

import (
	"fmt"
	"net/smtp"
	"os"
)

func EnviarEmailConfirmacao(nome string, email string) error {

	from := os.Getenv("EMAIL_USER")
	password := os.Getenv("EMAIL_PASS")

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	to := []string{email}

	message := []byte(
		"Subject: Confirmação de Venda\r\n" +
			"MIME-Version: 1.0;\r\n" +
			"Content-Type: text/plain; charset=\"UTF-8\";\r\n\r\n" +
			fmt.Sprintf(
				"Olá %s,\n\n"+
					"Sua venda foi confirmada com sucesso!\n\n"+
					"Próximos passos:\n"+
					"- Aguarde o envio dos documentos\n"+
					"- Confirme seu email quando solicitado\n\n"+
					"Stark Concessionária",
				nome,
			),
	)

	auth := smtp.PlainAuth("", from, password, smtpHost)

	err := smtp.SendMail(
		smtpHost+":"+smtpPort,
		auth,
		from,
		to,
		message,
	)

	return err
}
