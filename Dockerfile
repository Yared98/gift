# ==========================================
# Estágio 1: Build do Frontend (React + Vite)
# ==========================================
FROM node:22-alpine AS client-builder
WORKDIR /app/client

# Instala dependências aproveitando cache de camadas
COPY client/package*.json ./
RUN npm ci

# Copia código-fonte e compila os estáticos para dist/
COPY client/ ./
RUN npm run build

# ==========================================
# Estágio 2: Build do Backend (Rust Axum)
# ==========================================
FROM rust:alpine AS server-builder
RUN apk add --no-cache musl-dev build-base perl

WORKDIR /app/server

# Cache de dependências do Cargo
COPY server/Cargo.toml ./
RUN mkdir -p src && echo "fn main() {}" > src/main.rs
RUN cargo build --release || true
RUN rm -rf src target/release/deps/server*

# Copia o código-fonte real e compila o executável estático
COPY server/src ./src
RUN cargo build --release

# ==========================================
# Estágio 3: Imagem Final de Execução (Alpine Leve)
# Consumo médio: ~15-25MB de RAM
# ==========================================
FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata wget

WORKDIR /app

# Copia o executável Rust e os arquivos estáticos do Frontend
COPY --from=server-builder /app/server/target/release/server /app/server
COPY --from=client-builder /app/client/dist /app/client/dist

# Variáveis de ambiente padrão
ENV PORT=8080
ENV DATA_DIR=/app/data
ENV RUST_LOG=info

# Exposição da porta
EXPOSE 8080

# Volume para persistência do SQLite
VOLUME ["/app/data"]

# Verificação de integridade
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/robots.txt || exit 1

CMD ["/app/server"]
