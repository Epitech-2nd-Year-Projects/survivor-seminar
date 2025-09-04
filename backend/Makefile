MIGRATION_DIR ?= migrations
DB_URL ?=
NAME = back

build:
	go build -o $(NAME) ./cmd/jeb

migrate-install:
	go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

migrate-up:
	migrate -path $(MIGRATION_DIR) -database "$(DB_URL)" up

migrate-down:
	migrate -path $(MIGRATION_DIR) -database "$(DB_URL)" down 1