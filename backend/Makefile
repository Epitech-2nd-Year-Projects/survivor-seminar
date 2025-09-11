MIGRATION_DIR ?= migrations

-include .env
DB_URL ?= $(DATABASE_URL)

NAME = back

build:
	go build -o $(NAME) ./cmd/jeb

migrate-install:
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

migrate-up:
	$(MAKE) check-db-url
	migrate -path $(MIGRATION_DIR) -database "$(DB_URL)" up

migrate-down:
	$(MAKE) check-db-url
	migrate -path $(MIGRATION_DIR) -database "$(DB_URL)" down

check-db-url:
	@if [ -z "$(DB_URL)" ]; then \
		echo "Error: DB_URL is not set."; \
		echo "- Define DATABASE_URL in .env"; \
		echo "- Or pass DB_URL=postgres://user:pass@host:port/db?sslmode=disable"; \
		exit 1; \
	fi

test:
	go test ./... -coverprofile=coverage.out
	go tool cover -func=coverage.out

cover-html: test
	go tool cover -html=coverage.out

openapi-install:
	go install github.com/swaggo/swag/cmd/swag@latest

openapi:
	swag init -g ./cmd/jeb/main.go -o ./docs --outputTypes yaml --parseInternal

.PHONY: check-db-url openapi openapi-install cover-html test check-db-url migrate-down migrate-up migrate-install build
