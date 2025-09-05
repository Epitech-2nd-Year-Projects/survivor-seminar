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
	migrate -path $(MIGRATION_DIR) -database "$(DB_URL)" down

test:
	go test ./... -v

test-cover:
	go test ./... -coverprofile=coverage.out

cover-html: test-cover
	go tool cover -html=coverage.out