package cliente

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

func gerarTokenEmail() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

type emailPythonPayload struct {
	ClienteID       uint   `json:"cliente_id"`
	Nome            string `json:"nome"`
	Email           string `json:"email"`
	LinkVerificacao string `json:"link_verificacao"`
}

func enviarEmailViaPython(ctx context.Context, pythonURL string, payload emailPythonPayload) (int, string, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return 0, "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, pythonURL, bytes.NewReader(body))
	if err != nil {
		return 0, "", err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 8 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return 0, "", err
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	respBody := string(respBytes)

	if resp.StatusCode >= 400 {
		return resp.StatusCode, respBody, fmt.Errorf("python respondeu %d: %s", resp.StatusCode, respBody)
	}

	return resp.StatusCode, respBody, nil
}
