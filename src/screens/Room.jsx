import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback((data) => {
    const { email, id } = data;
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(
    async (data) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
      setMyStream(stream);
    },
    [remoteSocketId, socket]
  );

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  const handleNegotioationIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegotioationFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);

    return () => {
      peer.peer.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  }, [handleNegotiationNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (event) => {
      const remoteStream = event.streams;
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegotioationIncomming);
    socket.on("peer:nego:final", handleNegotioationFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegotioationIncomming);
      socket.off("peer:nego:final", handleNegotioationFinal);
    };
  }, [
    handleCallAccepted,
    handleIncommingCall,
    handleNegotioationFinal,
    handleNegotioationIncomming,
    handleUserJoined,
    socket,
  ]);

  return (
    <>
      <div>Room</div>
      <h1>{remoteSocketId ? "connected" : "no one in Room"}</h1>
      {myStream && (
        <button
          className="w-40 m-2 mx-20  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={sendStreams}
        >
          Send Stream
        </button>
      )}
      {remoteSocketId && (
        <button
          className="w-40 m-2 mx-20  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={handleCallUser}
        >
          Call
        </button>
      )}
      <div className="flex">
        <div>
          {
            <>
              {myStream && (
                <>
                  <h1>My stream</h1>
                  <ReactPlayer
                    width={400}
                    height={400}
                    url={myStream}
                    playing
                  />
                </>
              )}
            </>
          }
        </div>
        <div>
          {
            <>
              {remoteStream && (
                <>
                  <h1>Remote stream</h1>
                  <ReactPlayer
                    width={400}
                    height={400}
                    url={remoteStream}
                    playing
                  />
                </>
              )}
            </>
          }
        </div>
      </div>
    </>
  );
};

export default Room;
