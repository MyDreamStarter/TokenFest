package main

import (
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/soumalya340/DreamStarter/smartcontracts/api"
	"github.com/soumalya340/DreamStarter/smartcontracts/api/config"
)

func main() {
	var dir, _ = os.Getwd()
	config.Dir = dir
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true

	api.ApplyRoutes(router)
	router.Use(cors.New(config))
	router.Run(":9080")
}
