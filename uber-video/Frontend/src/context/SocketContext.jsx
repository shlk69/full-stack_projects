import { API_BASE_URL } from "../config";
import { io } from "socket.io-client";

import { SocketContext } from "./ContextDefinitions";

const apiBase = API_BASE_URL;
const socket = io(apiBase?.startsWith('/') ? window.location.origin : apiBase); 

const SocketProvider = ({ children }) => {

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
