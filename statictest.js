import { WebSocketServer } from "ws";
import express from "express";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

let Actuators = {};
let Instruments = {
  Pitch: 10,
  Yaw: 20,
  Roll: 30,
  Pinch: 4,
};

// Initialize Actuators
for (let i = 1; i <= 4; i++) {
  Actuators[i] = {
    id: i,
    name: `Actuator ${i}`,
    status: "Active",
    readData: {
      "Actual Position": i,
      "Actual Velocity": i,
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

// ✅ Update Data Every 10ms and Broadcast to Clients
setInterval(() => {
  let actualPosition = Math.random() * 100;

  for (let i = 1; i <= 4; i++) {
    Actuators[i].readData["Actual Position"] = actualPosition.toFixed(2);
    Actuators[i].readData["Actual Velocity"] = actualPosition.toFixed(2);
    Actuators[i].readData["Joint Angle"] = actualPosition.toFixed(2);
    Actuators[i].readData["Actual Torque"] = actualPosition.toFixed(2);
    Instruments["Pinch"]=actualPosition.toFixed(2);
    Instruments["Pitch"]=actualPosition.toFixed(2);
    Instruments["Roll"]=actualPosition.toFixed(2);
    Instruments["Yaw"]=actualPosition.toFixed(2);
  }

  const dataToSend = JSON.stringify({ type: "update", Actuators, Instruments });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(dataToSend);
    }
  });
}, 1000);

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send initial data
  ws.send(JSON.stringify({ type: "initialData", Actuators, Instruments }));

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "updateWriteData") {
        const { instrumentId, key, value } = data;
        if (Actuators[instrumentId]) {
          Actuators[instrumentId].writeData[key] = value;
        }
      } else if (data.type === "updateInstrument") {
        const { instrumentKey, value } = data;
        if (Instruments[instrumentKey] !== undefined) {
          Instruments[instrumentKey] = value;
        }
      }

      // Broadcast updated data
      const updateMsg = JSON.stringify({ type: "update", Actuators, Instruments });
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(updateMsg);
        }
      });
    } catch (err) {
      console.error("Invalid message format", err);
    }
  });

  ws.on("close", () => console.log("Client disconnected"));
});

const PORT = 5002;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
