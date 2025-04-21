import { useEffect, useState, useRef } from "react";
import Plot from "react-plotly.js";
import "./Plot.css";

const RealTimeChart = ({ ws, activeActuator }) => {
  const [parameterData, setParameterData] = useState({});
  const [selectedParameters, setSelectedParameters] = useState({});
  const startTimeRef = useRef(Date.now());

  const availableParams = [
    "Actual Position",
    "Actual Velocity",
    "Actual Torque",
    "Target Position",
    "Target Velocity",
    "Target Torque",
  ];

  const layoutRef = useRef({
    title: "Real-Time Data vs Time",
    xaxis: {
      title: "Time (s)",
      autorange: true,
    },
    yaxis: { title: "Values" },
    autosize: true,
    dragmode: "pan",
    hovermode: "closest",
    showlegend: true,
    scrollZoom: true,
   
  });

  const handleParameterChange = (param) => {
    if (!activeActuator) return;
    const actuatorId = activeActuator.toString();

    setSelectedParameters((prev) => {
      const current = prev[actuatorId] || [];
      const updated = current.includes(param)
        ? current.filter((p) => p !== param)
        : [...current, param];
      return { ...prev, [actuatorId]: updated };
    });
  };

  useEffect(() => {
    if (!ws) return;

    const handleDataUpdate = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "update" && data.Actuators) {
          const now = (Date.now() - startTimeRef.current) / 1000;

          setParameterData((prevData) => {
            const newData = { ...prevData };

            Object.entries(data.Actuators).forEach(([actuatorId, actuator]) => {
              const selected = selectedParameters[actuatorId] || [];
              if (!newData[actuatorId]) newData[actuatorId] = {};

              selected.forEach((param) => {
                const value =
                  actuator.readData?.[param] ??
                  actuator.writeData?.[param] ??
                  0;

                if (!newData[actuatorId][param]) {
                  newData[actuatorId][param] = [];
                }

                newData[actuatorId][param].push({ t: now, v: value });
              });
            });

            return newData;
          });
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.addEventListener("message", handleDataUpdate);
    return () => ws.removeEventListener("message", handleDataUpdate);
  }, [ws, selectedParameters]);

  // Compute the latest timestamp and update the layout to include 20s buffer
  const allTimes = Object.values(parameterData)
    .flatMap((params) => Object.values(params).flatMap((arr) => arr.map((d) => d.t)));
  const maxTime = allTimes.length > 0 ? Math.max(...allTimes) : 0;

  layoutRef.current.xaxis.range = [10, maxTime + 20];
  layoutRef.current.xaxis.autorange = false;

  return (
    <div className="plot-g">
      <h3>Real-Time Data Plot</h3>

      {activeActuator && (
        <div className="checkbox">
          <div style={{ marginTop: "5px" }}>
            {availableParams.map((param) => (
              <label key={param} style={{ marginRight: "10px" }}>
                <input
                  type="checkbox"
                  checked={
                    selectedParameters[activeActuator]?.includes(param) || false
                  }
                  onChange={() => handleParameterChange(param)}
                />
                {param}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="plot-container">
        <Plot
          data={Object.entries(parameterData).flatMap(([actuatorId, params]) =>
            Object.entries(params).map(([param, values]) => ({
              x: values.map((d) => d.t),
              y: values.map((d) => d.v),
              type: "scatter",
              mode: "lines",
              name: `Actuator ${actuatorId} - ${param}`,
            }))
          )}
          layout={layoutRef.current}
          useResizeHandler
          style={{ width: "100%", height: "500px", margin: "auto" }}
          config={{
            staticPlot: false,
            scrollZoom: true,
            displayModeBar: true,
          }}
        />
      </div>
    </div>
  );
};

export default RealTimeChart;
