package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"
	"github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/server"
)

func main() {
	cfg, err := config.NewConfig()
	if err != nil {
		panic(err)
	}

	srv := server.NewHTTPServer(cfg)

	go func() {
		if err := srv.Start(); err != nil {
			log.Printf("server stopped: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	_ = srv.Shutdown(context.Background())
}
