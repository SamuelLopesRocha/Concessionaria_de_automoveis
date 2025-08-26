#docker-compose up --build

#parar e apagar os containers
#docker-compose down -v


# Etapa de build
FROM golang:1.24 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Compila o binário estaticamente
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main .

# Etapa de execução com distroless estático (sem libc, seguro e leve)
FROM gcr.io/distroless/static

WORKDIR /app

COPY --from=builder /app/main .

EXPOSE 6000

CMD ["./main"]