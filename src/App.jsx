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
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const ws = useRef(null);
  const [activeSection, setActiveSection] = useState(null);
  const [mode, setMode] = useState(null);
  const [start, setStart] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // cleanup
  }, []);

  const showTime =
    String(currentTime.getHours()).padStart(2, '0') + ':' +
    String(currentTime.getMinutes()).padStart(2, '0') + ':' +
    String(currentTime.getSeconds()).padStart(2, '0');


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
            <div className="switch-container">
              <input type="checkbox" id="checkbox" />
              <label htmlFor="checkbox" className="switch" onClick={() => {
                setStart(!start);
                if (!start) {
                  showToast("Simulation Started", "success");
                } else {
                  showToast("Simulation Stopped", "error");
                }
              }}>
                Start
                <svg
                  className="slider"
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
              <Plot start={start} />
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
            <div><ActuatorList start={start} /></div>
            <div><DataVisualizer start={start} /></div>
          </div>
        </div>
        <div className="Tool-Bar">
          <span className="simulation">
            <button
              className="Button"
              onClick={() => {
                showToast("Simulation Mode Activated", "success");
                setMode("simulation");
              }}
            >
              Simulation Mode
            </button>
            {mode === "simulation" && (<div class="beep"></div>)}
          </span>
          <span className="simulation">
            <button className="Button" onClick={() => { showToast("Hardware Mode Activated", "success"); setMode("hardware"); }}>Hardware Mode</button>
            {mode === "hardware" && (<div class="beep"></div>)}
          </span>
          <InstrumentSelector instruments={instruments} selectedInstrument={selectedInstrument}
            onSelect={setSelectedInstrument} />
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
