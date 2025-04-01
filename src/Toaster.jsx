import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";
const VibrantToaster = () => {
  return <Toaster position="top-center" toastOptions={{
    className:"toast",
    success: {
      icon: <CheckCircle color="green" size={24} />,
      className:"toast",
    },
    error: {
      icon: <XCircle color="red" size={24} />,
     // style: { background: "#F44336", color: "white" }
    }
  }} />;
}
export default VibrantToaster;
 