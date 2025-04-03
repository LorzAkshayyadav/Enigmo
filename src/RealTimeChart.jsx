import { useEffect, useState, useRef } from "react";
import Plot from "react-plotly.js";
import "./Plot.css";

const RealTimeChart = ({ instrumentId, ws }) => {
  const [dataPoints, setDataPoints] = useState({ x: [], data: {} });
  const [selectedParameters, setSelectedParameters] = useState([]);
  const startTimeRef = useRef(Date.now());

  const availableParams = [
    "Actual Position",
    "Actual Velocity",
    "Actual Torque",
    "Target Position",
    "Target Velocity",
    "Target Torque",
  ];

  const handleParameterChange = (param) => {
    setSelectedParameters((prev) =>
      prev.includes(param) ? prev.filter((p) => p !== param) : [...prev, param]
    );
  };

  useEffect(() => {
    if (!ws || !instrumentId || selectedParameters.length === 0) return;

    const handleDataUpdate = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "update" && data.Actuators?.[instrumentId]) {
          const elapsedTime = (Date.now() - startTimeRef.current) / 1000;

          setDataPoints((prev) => {
            const newX = [...prev.x, elapsedTime];
            const newData = { ...prev.data };

            selectedParameters.forEach((param) => {
              const value =
                data.Actuators[instrumentId].readData?.[param] ??
                data.Actuators[instrumentId].writeData?.[param] ??
                0;
              newData[param] = [...(newData[param] || []), value];
            });

            return { x: newX, data: newData };
          });
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    ws.addEventListener("message", handleDataUpdate);
    return () => ws.removeEventListener("message", handleDataUpdate);
  }, [ws, instrumentId, selectedParameters]);

  return (
    <div className="plot-g">
    <h3>Real-Time Data Plot</h3>
    <div className="checkbox">
      {availableParams.map((param) => (
        <label key={param} style={{ marginRight: "10px" }}>
          <input
            type="checkbox"
            checked={selectedParameters.includes(param)}
            onChange={() => handleParameterChange(param)}
          />
          {param}
        </label>
      ))}
    </div>
  
    {selectedParameters.length > 0 && (
      <div className="plot-container">
        <Plot
          className="Plotly"
          data={selectedParameters.map((param) => ({
            x: dataPoints.x,
            y: dataPoints.data[param] || [],
            type: "scatter",
            mode: "lines",
            name: param,
          }))}
          layout={{
            title: "Real-Time Data vs Time",
            xaxis: { title: "Time (s)" },
            yaxis: { title: "Values" },
            autosize: true, // Makes it responsive
          }}
        />
      </div>
    )}
  </div>
  );  
};

export default RealTimeChart;
