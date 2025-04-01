import { useState, useEffect, useRef } from "react";
import "./App.css";

function DataVisualizer() {
  const [values, setValues] = useState({ Pitch: 0, Yaw: 0, Roll: 0, Pinch: 0 });
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:5002");

    ws.current.onopen = () => {
      console.log("Connected to WebSocket Server");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update" && data.Instruments) {
        setValues((prev) => ({
          ...prev,
          ...data.Instruments,
        }));
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected. Reconnecting...");
      setTimeout(() => {
        ws.current = new WebSocket("ws://localhost:5002");
      }, 3000);
    };

  }, []);

  const handleChange = (param, newValue) => {
    const updatedValues = { ...values, [param]: newValue };
    setValues(updatedValues);

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({ type: "updateWriteData", instrumentId: param, value: newValue })
      );
    }
  };

  return (
    <>
      <h2>Instrument Controls</h2>
      <div className="container">
        {Object.entries(values).map(([key, value]) => (
          <div key={key} className="demo">
              <div className="range-slider">
                <span className="range-label">
                <span>{key}</span>
                  <span><input type="range" value={value} min="-180" max="180" range="true"
                  onChange={(e) => handleChange(key, Number(e.target.value))}/></span>
                  <span className="range-value">{value}°</span>
                  </span>
                  
              </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default DataVisualizer;
