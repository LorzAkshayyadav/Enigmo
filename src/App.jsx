import "./App.css";
import { Model } from "./Robot";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedActuator, setSelectedActuator] = useState(null);
  const dropdownRef = useRef(null);

  const instruments = ["Scissor", "Grasper", "Holder", "Disector", "Teneculum"];
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

  const [actuators, setActuators] = useState([
    { id: 1, jointAngle: 0, torque: 0 },
    { id: 2, jointAngle: 0, torque: 0 },
    { id: 3, jointAngle: 0, torque: 0 },
    { id: 4, jointAngle: 0, torque: 0 },
  ]);

  // Update actuator data every second
  useEffect(() => {
    const interval = setInterval(() => {
      setActuators((prev) =>
        prev.map((actuator) => ({
          ...actuator,
          jointAngle: Math.random() * 180, // 0-180 degrees
          torque: Math.random() * 10, // 0-10 Nm
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
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
    actuators.forEach((actuator) => {
      newExpandedState[actuator.id] = newState;
    });
    setExpandedActuators(newExpandedState);
  };

  return (
    <>
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
        <button className="graph">Plot Graph</button>
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
            {actuators.map((actuator) => (
              <div key={actuator.id} className="actuator-row">

                <button
                  className="actuator-btn"
                  onClick={() => toggleActuator(actuator.id)}
                >
                  Actuator {actuator.id} ▼
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
                      
                      <p><strong>Joint Angle:</strong> {actuator.jointAngle.toFixed(2)}°</p>
                      <p><strong>Torque:</strong> {actuator.torque.toFixed(2)} Nm</p>
                     
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          </div>
          <div>
          <h2>Instrument</h2>
          <div className="data-box">
      <p><strong>Pitch:</strong> {1}°</p>
      <p><strong>Pinch:</strong> {2}°</p>
      <p><strong>Yaw:</strong> {3}°</p>
      <p><strong>Roll: </strong> {4}°</p>
    </div>
          </div>
        </div>
        
      </div>
    </>
  );
}

export default App;
