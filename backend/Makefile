MIGRATION_DIR ?= migrations
DB_URL ?= postgresql://neondb_owner:npg_Jkg2UASd1NLM@ep-raspy-star-a291ftcu-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
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
	go test ./... -coverprofile=coverage.out
	go tool cover -func=coverage.out

cover-html: test-cover
	go tool cover -html=coverage.out