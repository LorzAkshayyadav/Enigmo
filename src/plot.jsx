import React, { useEffect, useState } from "react";
import RealTimeChart from "./RealTimeChart";
import "./Plot.css";
const Plot= () => {
  const [ws, setWs] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [instrumentId, setInstrumentId] = useState(null);
  const [instrumentData, setInstrumentData] = useState({}); // Store data for all actuators

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5002");

    socket.onopen = () => console.log("Connected to WebSocket server");
    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onclose = () => console.log("WebSocket closed");

    setWs(socket);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "update" && data.instruments) {
          setInstrumentData((prevData) => {
            const newData = { ...prevData };
            Object.keys(data.instruments).forEach((id) => {
              newData[id] = data.instruments[id]; // Store all instruments' data
            });
            return newData;
          });
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    return () => {
      socket.close();
      console.log("WebSocket connection closed");
    };
  }, []);

  return (
    <div className="Ui">
      <div className="cla">
        <h2>Actuators</h2>
        <div className="button-box">
          {[1, 2, 3, 4].map((id) => (
            <button 
              key={id}
              onClick={() => {
                setInstrumentId(id);
                setActiveSection(`Actuator ${id}`);
              }}
              className={activeSection === `Actuator ${id}` ? "active" : ""}
            >
              Actuator {id}
            </button>
          ))}
        </div>
      </div>

      <div className="plot">
        {ws && (
          <RealTimeChart
            key={instrumentId}
            instrumentId={instrumentId}
            ws={ws}
            instrumentData={instrumentData} // Pass stored data
          />
        )}
      </div>
    </div>
  );
};

export default Plot;
