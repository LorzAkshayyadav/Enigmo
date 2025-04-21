import React, { useEffect, useState } from "react";
import RealTimeChart from "./RealTimeChart";
import "./Plot.css";

const Plot = () => {
  const [ws, setWs] = useState(null);
  const [activeActuator, setActiveActuator] = useState(null);
  const [charts, setCharts] = useState([{ id: Date.now() }]); // Render 1 by default

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => console.log("Connected to WebSocket server");
    socket.onerror = (error) => console.error("WebSocket error:", error);
    socket.onclose = () => console.log("WebSocket closed");

    setWs(socket);
  }, []);

  const addPlot = () => {
    const newChartId = Date.now();
    setCharts((prev) => [...prev, { id: newChartId }]);
  };

  const removePlot = (id) => {
    setCharts((prev) => prev.filter((chart) => chart.id !== id));
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
        <button onClick={addPlot} className="add-plot-btn">+ Add Plot</button>
      </div>

      <div className="plot">
        {ws && (
          <div className="BOX">
            {charts.map((chart) => (
              <div key={chart.id} className="chart-wrapper">
                <button
                  className="close-btn"
                  onClick={() => removePlot(chart.id)}
                >
                  &times;
                </button>
                <RealTimeChart ws={ws} instrumentId={activeActuator} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Plot;
