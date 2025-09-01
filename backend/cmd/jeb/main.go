package main

import "github.com/Epitech-2nd-Year-Projects/survivor-seminar/internal/config"

func main() {
	_, err := config.NewConfig()
	if err != nil {
		panic(err)
	}
}
