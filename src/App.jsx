import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import toast from "react-hot-toast";
import { Model } from "./Robot";
import InstrumentSelector from "./InstrumentSelector";
import ActuatorList from "./Actuators";
import DataVisualizer from "./controls";
import VibrantToaster from "./Toaster";
import "./App.css";
import Background from "./Scene";
import Plot from "./plot";
function App() {
  const [instruments, setInstruments] = useState(["Scissor", "Grasper", "Holder", "Dissector", "Teneculum"]);
  const [actuators, setActuators] = useState([]);
  const ws = useRef(null);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    const connectWebSocket = () => {
      if (ws.current) return;

      ws.current = new WebSocket("ws://localhost:5002");

      ws.current.onopen = () => {
        console.log("Connected to WebSocket server");
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WebSocket Data Received:", data);

        if (data.type === "initialData" || data.type === "update") {
          setActuators(Object.values(data.Actuators || {}));
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket Disconnected. Reconnecting...");
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();
  }, []);
  //Time
  const date = new Date();
  const showTime =
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0') + ':' +
    String(date.getSeconds()).padStart(2, '0');



  const handleInstrumentSelect = (selectedInstrument) => {
    console.log(`Selected Instrument: ${selectedInstrument}`);
  };

  const showToast = (message, type) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <>
      <VibrantToaster />
      <div className="Window">
        <div className="App">
          <div className="wer1">
            <div class="switch-container">
              <input type="checkbox" id="checkbox" />
              <label for="checkbox" class="switch">
                Start
                <svg
                  class="slider"
                  viewBox="0 0 512 512"
                  height="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V256c0 17.7 14.3 32 32 32s32-14.3 32-32V32zM143.5 120.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"
                  ></path>
                </svg>
              </label>
              <span>
                <img className="image" height={50} width={100} src="src\assets\meril__FULL__logo.png" />
              </span>
              <span className="time">
                <p>{showTime}</p>
              </span>
            </div>
            {activeSection === "plotData" && (
              <Plot />
            )}
            {activeSection !== "plotData" && (
              <div>
                <Canvas shadows camera={{ position: [100, 200, 100], fov: 45 }} style={{ height: "100vh" }}>
                  <ambientLight intensity={0.9} />
                  <Background />
                  <Model />
                  <OrbitControls enableZoom />
                </Canvas>
              </div>)}
          </div>

          <div className="wer">
            <div><ActuatorList actuators={actuators} /></div>
            <div><DataVisualizer /></div>
          </div>
        </div>
        <div className="Tool-Bar">
          <button className="Button" onClick={() => showToast("Simulation Mode Activated", "success")}>Simulation Mode</button>
          <button className="Button" onClick={() => showToast("Hardware Mode Activated", "success")}>Hardware Mode</button>
          <InstrumentSelector instruments={instruments} onSelect={handleInstrumentSelect} />
          <button
            className="Button-plot"
            onClick={() => setActiveSection(prev => prev === "plotData" ? "robot" : "plotData")}
          >
            {activeSection === "plotData" ? "Robot-Model" : "Plot Graph"}
          </button>

        </div>
      </div>
    </>
  );
}

export default App;
