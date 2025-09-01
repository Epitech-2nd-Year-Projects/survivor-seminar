MIGRATION_DIR ?= migrations
DB_URL ?=

build:
	go build ./...

migrate-install:
	curl -L https://github.com/golang-migrate/migrate/releases/download/$version/migrate.$os-$arch.tar.gz | tar xvz

migrate-up:
	migrate -path $(MIGRATION_DIR) -database "$(DB_URL)" up

migrate-down:
	migrate -path $(MIGRATION_DIR) -database "$(DB_URL)" down 1