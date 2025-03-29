import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import axios from "axios";
import cors from "cors";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

const READ_API_URL = "https://random-data-api.com/api/sensor/random_sensor";  
const WRITE_API_URL = "http://example.com/write-data";  

let instruments = {};

const fetchReadData = async () => {
  try {
    const response = await axios.get(READ_API_URL);
    const data = response.data; 

    instruments = data.Instruments.reduce((acc, item) => {
      acc[item.id] = {
        id: item.id,
        name: item.name,
        status: item.status,
        readData: {
          "Actual Position": item.readData.actualPosition,
          "Actual Velocity": item.readData.actualVelocity,
          "Status Word": item.readData.statusWord,
          "Actual Torque": item.readData.actualTorque,
        },
        writeData: {
          "Target Position": item.writeData.targetPosition,
          "Target Velocity": item.writeData.targetVelocity,
          "Control Word": item.writeData.controlWord,
          "Target Torque": item.writeData.targetTorque,
        }
      };
      return acc;
    }, {});

    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type: "update", instruments }));
      }
    });

  } catch (error) {
    console.error("Error fetching read data:", error.message);
  }
};

setInterval(fetchReadData, 1);

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.send(JSON.stringify({ type: "initialData", instruments }));

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "updateWriteData") {
        const { instrumentId, key, value } = data;

        if (instruments[instrumentId]) {
          instruments[instrumentId].writeData[key] = value;
        }
        await axios.post(WRITE_API_URL, { instrumentId, key, value });

        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify({ type: "update", instruments }));
          }
        });
      }
    } catch (err) {
      console.error("Invalid message format:", err);
    }
  });

  ws.on("close", () => console.log("Client disconnected"));
});


const PORT = 5001;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
