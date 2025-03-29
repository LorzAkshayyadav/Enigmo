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

const READ_API_URL = "https://randomuser.me/api/";
const WRITE_API_URL = "https://jsonplaceholder.typicode.com/posts";

let instruments = {};
let counter = 1;

const fetchReadData = async () => {
  try {
    const response = await axios.get(READ_API_URL);
    const userData = response.data;
    const newInstrument = {
      id: counter,
      name: `${userData.results[0].name.first} ${userData.results[0].name.last}`,
      status: "Active",
      readData: {
        "Age": userData.results[0].dob.age,
        "City": userData.results[0].location.city,
        "Latitude": userData.results[0].location.coordinates.latitude,
        "Longitude": userData.results[0].location.coordinates.longitude
      },
      writeData: {
        "Target Age": 25,
        "Target City": "New York",
        "Control Word": 80,
        "Target Latitude": userData.results[0].location.coordinates.latitude
      }
    };

    instruments[counter] = newInstrument;
    counter++;

   // console.log("Instruments Updated:", instruments);

    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type: "update", instruments }));
      }
    });

  } catch (error) {
    console.error("Error fetching read data:", error.message);
  }
};


setInterval(fetchReadData, 5000);


wss.on("connection", (ws) => {
  console.log("✅ Client Connected");

 
  ws.send(JSON.stringify({ type: "initialData", instruments: instruments || {} }));

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "updateWriteData") {
        const { instrumentId, key, value } = data;

        if (instruments[instrumentId]) {
          instruments[instrumentId].writeData[key] = value;
        }

        
        const response = await axios.post(WRITE_API_URL, { instrumentId, key, value });
        console.log("Write Response:", response.data);
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(JSON.stringify({ type: "update", instruments }));
          }
        });
      }
    } catch (err) {
      console.error("Invalid message format:", err);
    }
  });

  ws.on("close", () => console.log("Client Disconnected"));
});

// 🔹 Start Server
const PORT = 5000;
server.listen(PORT, () => console.log(`WebSocket server running on port ${PORT}`));
