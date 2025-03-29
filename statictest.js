import { WebSocketServer } from "ws";
import express from "express";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

let actualPosition = 0;
let Actuators = {};

// Initialize Actuators
for (let i = 1; i <= 4; i++) {
  Actuators[i] = {
    id: i,
    name: `Actuator ${i}`,
    status: "Active",
    readData: {
      "Actual Position": i,
      "Actual Velocity":i,
      "Joint Angle": i,
      "Actual Torque": i,
    },
    writeData: {
      "Target Position": 150 + i,
      "Target Velocity": 60 + i,
      "Control Word": 80 + i,
      "Target Torque": 40 + i,
    },
  };
}

// ✅ Update Data Every Second and Broadcast to Clients
setInterval(() => {
  actualPosition = Math.random() * 100; // Generate new value

  // Update Actuators' readData with new values
  for (let i = 1; i <= 4; i++) {
    Actuators[i].readData["Actual Position"] = actualPosition;
    Actuators[i].readData["Actual Velocity"] = actualPosition;
    Actuators[i].readData["Joint Angle"] = actualPosition;
    Actuators[i].readData["Actual Torque"] = actualPosition;
  }
  const dataToSend = JSON.stringify({ type: "update", Actuators });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(dataToSend);
    }
  });
}, 10);

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send initial actuator data
  ws.send(JSON.stringify({ type: "initialData", Actuators }));

  ws.on("message", (message) => {
    console.log("Received:", message);
    try {
      const data = JSON.parse(message);
      if (data.type === "updateWriteData") {
        const { instrumentId, key, value } = data;
        Actuators[instrumentId].writeData[key] = value;

        // Broadcast the updated write data to all clients
        const updateMsg = JSON.stringify({ type: "update", Actuators });
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(updateMsg);
          }
        });
      }
    } catch (err) {
      console.error("Invalid message format", err);
    }
  });

  ws.on("close", () => console.log("Client disconnected"));
});

const PORT = 5002;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
