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
const toRadians = (deg) => (deg * Math.PI) / 180;

// ✅ Update Data Every 10ms and Broadcast to Clients
let j=-180;
setInterval(() => {
   if(j>180){
      j=-180;
   }
  for (let i = 1; i <= 4; i++) {
    Actuators[i].readData["Actual Position"] = 100*Math.sin(toRadians(j)).toFixed(2);
    Actuators[i].readData["Actual Velocity"] = 200*Math.sin(toRadians(j)).toFixed(2);
    Actuators[i].readData["Joint Angle"] = j;
    Actuators[i].readData["Actual Torque"] = Math.sin(toRadians(j)).toFixed(2);
    Instruments["Pinch"]=j;
    Instruments["Pitch"]=j;
    Instruments["Roll"]=j;
    Instruments["Yaw"]=j;
  }
  j+=1;
  const dataToSend = JSON.stringify({ type: "update", Actuators, Instruments });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(dataToSend);
    }
  });
}, 90);

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

const PORT = 5000;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
