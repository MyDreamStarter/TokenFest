package contracts

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/soumalya340/DreamStarter/smartcontracts/api/config"
)

func ApplyRoutes(r *gin.RouterGroup) {
	g := r.Group("/deploy")
	{
		g.POST("", DeployContract)
	}
}

func DeployContract(c *gin.Context) {
	var req Contract
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "message": "Failed to bind request"})
		return
	}

	network := req.Network

	jsonByte, err := json.Marshal(req.Data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error(), "message": "failed to encode request body"})
		return
	}
	response, err := genResponse(jsonByte, network)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	finalResponse := strings.Split(string(response), "\n")[7]

	c.JSON(http.StatusOK, finalResponse)
}

func genResponse(jsonByte []byte, network string) ([]byte, error) {
	os.Chdir(config.Dir)
	filePath := "scripts/launch/launch.json"

	_, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Println("error reading")
		return nil, err
	}

	err = os.WriteFile(filePath, []byte(jsonByte), 0644)
	if err != nil {
		fmt.Println("error writing")

		return nil, err
	}

	err = os.Chdir(".")
	if err != nil {
		return nil, err
	}

	// Execute the yarn launch command
	cmd := exec.Command("yarn", "launch", "--network", network)
	var outb, errb bytes.Buffer
	cmd.Stdout = &outb
	cmd.Stderr = &errb
	err = cmd.Start()
	if err != nil {
		return nil, err
	}
	err = cmd.Wait()
	if err != nil {
		log.Printf("Command finished with error: %v", err.Error())
		return nil, err
	}

	return outb.Bytes(), nil
}
