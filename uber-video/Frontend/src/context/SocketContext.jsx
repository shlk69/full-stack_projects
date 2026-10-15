import { useEffect } from "react";
import { io } from "socket.io-client";

import { SocketContext } from "./ContextDefinitions";

const apiBase = import.meta.env.VITE_BASE_URL;
const socket = io(apiBase?.startsWith('/') ? window.location.origin : apiBase); 

const SocketProvider = ({ children }) => {
  useEffect(() => {
    // Basic connection logic
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
