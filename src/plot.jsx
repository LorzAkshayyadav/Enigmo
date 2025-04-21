import React, { useEffect, useState } from "react";
import RealTimeChart from "./RealTimeChart";
import "./Plot.css";

const Plot = ({ start }) => {
  const [ws, setWs] = useState(null);
  const [activeActuator, setActiveActuator] = useState(null);
  const [plots, setPlots] = useState([0]);
  const [plotIdCounter, setPlotIdCounter] = useState(1);

  useEffect(() => {
    if (!start) {
      if (ws) {
        ws.close();
        setWs(null);
      }
      return;
    }

    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => console.log("Connected to WebSocket server");
    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onclose = () => console.log("WebSocket closed");

    setWs(socket);

  
  }, [start]);

  const addPlot = () => {
    setPlots((prev) => [...prev, plotIdCounter]);
    setPlotIdCounter((prev) => prev + 1);
  };

  const removePlot = (id) => {
    setPlots((prev) => prev.filter((plotId) => plotId !== id));
  };

  return (
    <div className="Ui">
      <div className="cla">
        <h2>Actuators</h2>
        <div className="button-box">
          {[1, 2, 3, 4].map((id) => (
            <button
              key={id}
              onClick={() => setActiveActuator(id)}
              className={activeActuator === id ? "active" : ""}
            >
              Actuator {id}
            </button>
          ))}
        </div>
        <button onClick={addPlot} className="add-plot-btn">Add Plot</button>
      </div>

      <div className="plot">
        <div className="BOX">
          {plots.map((id) => (
            <div key={id} className="plot-wrapper">
              <button className="close-btn" onClick={() => removePlot(id)}>
                &times;
              </button>
              <RealTimeChart ws={ws} activeActuator={activeActuator} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Plot;
