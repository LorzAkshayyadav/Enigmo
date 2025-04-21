import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import toast from "react-hot-toast";

const InstrumentSelector = ({ instruments, selectedInstrument, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button className="Button menu-bar" onClick={() => setIsOpen(!isOpen)}>
        {selectedInstrument || "Instrument Type"} ▼
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
                  onSelect(instrument);
                  setIsOpen(false);
                 selectedInstrument===instrument?toast.error("Already Selected"):toast.success(`${instrument} Selected`)
                }}
              >
                {instrument}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InstrumentSelector;
