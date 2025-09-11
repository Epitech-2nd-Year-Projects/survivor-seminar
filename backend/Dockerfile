FROM golang:1.22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache ca-certificates git build-base

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ENV CGO_ENABLED=0 GOOS=linux
RUN go build -o /out/back ./cmd/jeb


FROM alpine:3.20 AS runner
WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata && \
    adduser -D -H appuser

COPY --from=builder /out/back /usr/local/bin/back
COPY --from=builder /app/configs ./configs

USER appuser
EXPOSE 1111
CMD ["/usr/local/bin/back"]

