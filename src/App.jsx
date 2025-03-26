import "./App.css";
import { Model } from "./Robot";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const instruments = ["Guitar", "Piano", "Violin", "Drums", "Flute", "Saxophone", "Trumpet", "Cello", "Harmonica"];

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

  return (
    <>
      {/* Toolbar */}
      <div className="Tool-Bar">
        <button className="graph1">Simulation Mode</button>
        <button className="graph1">Hardware Mode</button>

        {/* Dropdown Button */}
        <div className="relative" ref={dropdownRef}>
          <button className="graph1 menu-bar" onClick={() => setIsOpen(!isOpen)}>
            Instrument Type ▼
          </button>

          {/* Dropdown Menu */}
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

        <button className="graph">Plot Graph</button>
      </div>

      {/* Main Content */}
      <div className="App">
        <span className="heading">
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
          <h3>Switch:</h3>
        </span>

        <Canvas camera={{ fov: 50, position: [-6, 6, 6] }}>
          <ambientLight intensity={7} />
          <OrbitControls enableZoom={true} />
          <Model />
        </Canvas>
      </div>
    </>
  );
}

export default App;
