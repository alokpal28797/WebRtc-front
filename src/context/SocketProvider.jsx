import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);
const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

const SocketProvider = (props) => {
  const socket = useMemo(() => io("localhost:8000"),[]);
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};

export { SocketProvider, useSocket };
