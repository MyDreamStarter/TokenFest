package api

import (
	"github.com/gin-gonic/gin"
	"github.com/soumalya340/DreamStarter/smartcontracts/api/contracts"
)

func ApplyRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		contracts.ApplyRoutes(api)
	}
}
