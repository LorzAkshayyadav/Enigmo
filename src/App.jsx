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
import  Background from "./Scene";
function App() {
  const [instruments, setInstruments] = useState(["Scissor", "Grasper", "Holder", "Dissector", "Teneculum"]);
  const [actuators, setActuators] = useState([]);
  const ws = useRef(null);
  const openPlotApp = async () => {
    try {
      const response = await fetch("http://192.168.175.1:3001", { mode: "no-cors" });
      window.open("http://192.168.175.1:3001", "_blank");
    } catch (error) {
      showToast("Plot Graph app is not running!", "error");
    }
  };

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
  const showTime = date.getHours() 
      + ':' + date.getMinutes() 
      + ":" + date.getSeconds();

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
            <div class="checkbox-wrapper-8">
              <input type="checkbox" id="cb3-8" class="tgl tgl-skewed" />
              <label for="cb3-8" data-tg-on="ON" data-tg-off="OFF" class="tgl-btn"></label>
              <span className="time">
                <p>{showTime}</p>
              </span>
            </div>
            <div>
              <Canvas shadows  camera={{ position: [100, 200, 100], fov: 45 }} style={{ height: "100vh" }}>
                <ambientLight intensity={0.9} />
               <Background />
                <Model />
                <OrbitControls enableZoom  />
              </Canvas>
            </div>
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
          <button className="Button-plot" onClick={openPlotApp}>Plot Graph</button>
        </div>
      </div>
    </>
  );
}

export default App;
