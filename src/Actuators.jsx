import { useState,useRef,useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import "./App.css";
const ActuatorList = ({start}) => {
  const [actuators, setActuators] = useState([]);
  const ws = useRef(null);
  useEffect(() => {
    if (!start) {
      
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      return;
    }
  
    const socket = new WebSocket("ws://localhost:5000");
    ws.current = socket;
  
    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };
  
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("WebSocket Data Received:", data);
  
      if (data.type === "initialData" || data.type === "update") {
        setActuators(Object.values(data.Actuators || {}));
      }
    };
  
    socket.onclose = () => {
      console.log("WebSocket Disconnected.");
    };
  
    return () => {
      socket.close();
      ws.current = null;
    };
  }, [start]);
  
  const [expandedActuators, setExpandedActuators] = useState({});

  const toggleActuator = (id) => {
    setExpandedActuators((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
    <h2>Actuators</h2>
    <div className="actuator-list">
      {actuators.length > 0 ? (
        actuators.map((actuator) => (
          <motion.div
            key={actuator.id}
            className="actuator-row"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="actuator-header">
              <h3>{actuator.name}</h3>
            </div>
            <motion.div
              className="actuator-details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <p><strong>Joint Angle:</strong> {actuator.readData?.["Joint Angle"] ?? "N/A"}°</p>
              <p><strong>Torque:</strong> {actuator.readData?.["Actual Torque"] ?? "N/A"} Nm</p>
            </motion.div>
          </motion.div>
        ))
      ) : (
        <p className="no-actuator">No Actuators Available</p>
      )}
    </div>
  </>
  
  );
};

export default ActuatorList;
