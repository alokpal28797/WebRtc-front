import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const socket = useSocket();
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(async(data)=>{
    const {email, room} = data;
    navigate(`/room/${room}`)
  },[navigate])

  useEffect(()=>{
    socket.on("room:join",handleJoinRoom)

    return ()=>{
      socket.off('room:join');
    }
  },[handleJoinRoom, socket])

  return (
    <div className="flex justify-center items-center h-screen ">
      <div className="w-72">
        <form
          onSubmit={(e) => {
            handleSubmitForm(e);
          }}
        >
          <div>
            <input
              className="block mb-2 w-full rounded-md border-0 py-3 pl-7 pr-7 text-gray-900   ring-2 ring-inset ring-gray-300"
              type="email"
              placeholder="Enter your email here"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <input
              className="block mb-2  w-full rounded-md border-0 py-3 pl-7 pr-7 text-gray-900  ring-2 ring-inset ring-gray-300"
              type="text"
              placeholder="Enter room code"
              value={room}
              onChange={(e) => {
                setRoom(e.target.value);
              }}
            />
          </div>
          <div className="text-center">
            <button
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
              type="submit"
            >
              Enter Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LobbyScreen;
