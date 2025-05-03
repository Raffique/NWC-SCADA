package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/goburrow/modbus"
)

type Device struct {
	ID       string            `json:"id"`
	Name     string            `json:"name"`
	Type     string            `json:"type"`
	Protocol string            `json:"protocol"`
	Address  string            `json:"address"`
	Status   string            `json:"status"`
	LastSeen string           `json:"lastSeen"`
	Readings map[string]float64 `json:"readings,omitempty"`
}

var (
	devices = make(map[string]*Device)
	mu      sync.RWMutex
)

// MQTT client options
var mqttOpts = mqtt.NewClientOptions().
	AddBroker("tcp://localhost:1883").
	SetClientID("nwc-scada-backend")

// Modbus client handler
type ModbusHandler struct {
	clients map[string]modbus.Client
	mu      sync.RWMutex
}

func newModbusHandler() *ModbusHandler {
	return &ModbusHandler{
		clients: make(map[string]modbus.Client),
	}
}

func (h *ModbusHandler) getClient(address string) (modbus.Client, error) {
	h.mu.RLock()
	client, exists := h.clients[address]
	h.mu.RUnlock()

	if exists {
		return client, nil
	}

	// Create new Modbus TCP client
	handler := modbus.NewTCPClientHandler(address)
	handler.Timeout = 10 * time.Second
	handler.SlaveId = 1

	err := handler.Connect()
	if err != nil {
		return nil, err
	}

	client = modbus.NewClient(handler)
	
	h.mu.Lock()
	h.clients[address] = client
	h.mu.Unlock()

	return client, nil
}

func main() {
	app := fiber.New()

	// Enable CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Initialize MQTT client
	mqttClient := mqtt.NewClient(mqttOpts)
	if token := mqttClient.Connect(); token.Wait() && token.Error() != nil {
		log.Fatal(token.Error())
	}

	// Initialize Modbus handler
	modbusHandler := newModbusHandler()

	// Device management endpoints
	app.Get("/api/devices", func(c *fiber.Ctx) error {
		mu.RLock()
		deviceList := make([]Device, 0, len(devices))
		for _, device := range devices {
			deviceList = append(deviceList, *device)
		}
		mu.RUnlock()
		return c.JSON(deviceList)
	})

	app.Post("/api/devices", func(c *fiber.Ctx) error {
		var device Device
		if err := c.BodyParser(&device); err != nil {
			return err
		}

		device.Status = "offline"
		device.LastSeen = time.Now().Format(time.RFC3339)
		device.Readings = make(map[string]float64)

		mu.Lock()
		devices[device.ID] = &device
		mu.Unlock()

		return c.JSON(device)
	})

	app.Put("/api/devices/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		var updatedDevice Device
		if err := c.BodyParser(&updatedDevice); err != nil {
			return err
		}

		mu.Lock()
		if device, exists := devices[id]; exists {
			device.Name = updatedDevice.Name
			device.Type = updatedDevice.Type
			device.Protocol = updatedDevice.Protocol
			device.Address = updatedDevice.Address
		}
		mu.Unlock()

		return c.SendStatus(http.StatusOK)
	})

	app.Delete("/api/devices/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		
		mu.Lock()
		delete(devices, id)
		mu.Unlock()

		return c.SendStatus(http.StatusOK)
	})

	// Device testing endpoint
	app.Post("/api/devices/:id/test", func(c *fiber.Ctx) error {
		id := c.Params("id")
		
		mu.RLock()
		device, exists := devices[id]
		mu.RUnlock()

		if !exists {
			return c.Status(http.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"error":   "Device not found",
			})
		}

		success := false
		var err error

		switch device.Protocol {
		case "mqtt":
			// Test MQTT connection
			if token := mqttClient.Publish(device.Address+"/test", 0, false, "test"); token.Wait() && token.Error() != nil {
				err = token.Error()
			} else {
				success = true
			}

		case "modbus":
			// Test Modbus connection
			client, err := modbusHandler.getClient(device.Address)
			if err == nil {
				_, err = client.ReadHoldingRegisters(0, 1)
				success = err == nil
			}

		case "opcua":
			// Implement OPC UA testing logic
			// This is a placeholder for demonstration
			success = true
		}

		if success {
			mu.Lock()
			device.Status = "online"
			device.LastSeen = time.Now().Format(time.RFC3339)
			mu.Unlock()
		}

		return c.JSON(fiber.Map{
			"success": success,
			"error":   err,
		})
	})

	// Start the server
	log.Fatal(app.Listen(":8080"))
}