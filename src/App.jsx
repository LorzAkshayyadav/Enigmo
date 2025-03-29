import "./App.css";
import { Model } from "./Robot";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import RealTimeChart from "./RealTimeChart"; 
function App() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const ws = useRef(null);
  const instruments = ["Scissor", "Grasper", "Holder", "Dissector", "Teneculum"];
  const openPlotApp = () => {
    window.open("http://localhost:3001", "_blank");
  };
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [expandedActuators, setExpandedActuators] = useState({});
  const [expandAll, setExpandAll] = useState(false);
  const [Actuators, setActuators] = useState([]);  // Initialize as an empty array

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
        if (data.type === "initialData") {
          setActuators(Object.values(data.Actuators || {}));  // Convert object to array
        }

        if (data.type === "update") {
          setActuators((prev) => {
            const updatedActuators = { ...prev };
            Object.values(data.Actuators || {}).forEach((actuator) => {
              updatedActuators[actuator.id] = actuator;
            });
            return Object.values(updatedActuators);
          });
        }
      };

      ws.current.onclose = () => {
        console.log("WebSocket Disconnected. Reconnecting in 3 seconds...");
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();
  }, []);

  // Toggle individual actuator
  const toggleActuator = (id) => {
    setExpandedActuators((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle all actuators
  const toggleAllActuators = () => {
    const newState = !expandAll;
    setExpandAll(newState);
    const newExpandedState = {};
    Actuators.forEach((actuator) => {
      newExpandedState[actuator.id] = newState;
    });
    setExpandedActuators(newExpandedState);
  };

  return (
    <>
      <Toaster />
      <div className="Tool-Bar">
        <button className="graph1">Simulation Mode</button>
        <button className="graph1">Hardware Mode</button>
        <div className="relative" ref={dropdownRef}>
          <button className="graph1 menu-bar" onClick={() => setIsOpen(!isOpen)}>
            Instrument Type ▼
          </button>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="dropdown-menu"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {instruments.map((instrument, index) => (
                  <button
                    key={index}
                    className="dropdown-item"
                    onClick={() => {
                      console.log(`Selected: ${instrument}`);
                      setIsOpen(false);
                    }}
                  >
                    {instrument}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button className="graph" onClick={toggleAllActuators}>
          {expandAll ? "Collapse All Actuators" : "Show All Actuators"}
        </button>
        <button className="graph" onClick={openPlotApp}>Plot Graph</button>

      </div>

      <div className="App">
        <div className="wer1">
          <div>
            <span className="heading">
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
              <span className="bold">Switch :</span>
            </span>
          </div>
          <div>
            <Canvas camera={{ fov: 50, position: [-6, 6, 6] }}>
              <ambientLight intensity={7} />
              <OrbitControls enableZoom={true} />
              <Model />
            </Canvas>
          </div>
        </div>

        <div className="wer">
          <div>
            <h2>Actuators:</h2>
            <div className="actuator-list">
              {Actuators.length > 0 ? (
                Actuators.map((actuator) => (
                  <div key={actuator.id} className="actuator-row">
                    <button
                      className="actuator-btn"
                      onClick={() => toggleActuator(actuator.id)}
                    >
                      {actuator.name} ▼
                    </button>
                    <AnimatePresence>
                      {expandedActuators[actuator.id] && (
                        <motion.div
                          className="actuator-details"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p><strong>Joint Angle:</strong> {actuator.readData?.["Joint Angle"] ?? "N/A"}°</p>
                          <p><strong>Torque:</strong> {actuator.readData?.["Actual Torque"] ?? "N/A"} Nm</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <p>No Actuators Available</p>
              )}
            </div>
          </div>

          <div>
            <h2>Instrument</h2>
            <div className="data-box">
              <p><strong>Pitch:</strong> 1°</p>
              <p><strong>Pinch:</strong> 2°</p>
              <p><strong>Yaw:</strong> 3°</p>
              <p><strong>Roll:</strong> 4°</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
