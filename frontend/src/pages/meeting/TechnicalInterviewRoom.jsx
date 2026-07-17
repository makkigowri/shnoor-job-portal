import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import useAuth from "../../hooks/useAuth";
import { getMeetingRoom, joinMeetingRoom, endMeetingRoom } from "../../services/technicalInterviewService";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5001";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const formatDuration = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const parts = [mins, secs].map((n) => String(n).padStart(2, "0"));
  if (hrs > 0) parts.unshift(String(hrs).padStart(2, "0"));
  return parts.join(":");
};

export default function TechnicalInterviewRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [phase, setPhase] = useState("checking");
  const [errorMessage, setErrorMessage] = useState("");
  const [room, setRoom] = useState(null);
  const [role, setRole] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [remoteInfo, setRemoteInfo] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const cameraTrackRef = useRef(null);
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      cleanupAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, []);

  const cleanupAll = () => {
    clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};
    if (socketRef.current) {
      socketRef.current.emit("leave-room");
      socketRef.current.disconnect();
    }
  };

  const createPeerConnection = useCallback(
    (remoteSocketId) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peersRef.current[remoteSocketId] = pc;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("signal", {
            to: remoteSocketId,
            data: { candidate: event.candidate }
          });
        }
      };

      pc.ontrack = (event) => {
        setRemoteConnected(true);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setConnectionStatus("Connected");
        } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          setConnectionStatus("Reconnecting...");
          setRemoteConnected(false);
        } else if (pc.connectionState === "connecting") {
          setConnectionStatus("Connecting...");
        }
      };

      return pc;
    },
    []
  );

  const connectSocketAndSignal = useCallback(
    (interview, participantRole) => {
      const token = localStorage.getItem("shnoor_token");
      const socket = io(SOCKET_URL, {
        path: "/socket.io/meeting",
        auth: { token },
        transports: ["websocket", "polling"]
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join-room", { roomCode });
      });

      socket.on("joined-room", ({ existingParticipants }) => {
        (existingParticipants || []).forEach((participant) => {
          setRemoteInfo({ name: participant.name, role: participant.role });
        });
      });

      socket.on("participant-joined", async ({ socketId, name, role: joinedRole }) => {
        setRemoteInfo({ name, role: joinedRole });
        const pc = createPeerConnection(socketId);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("signal", { to: socketId, data: { sdp: offer } });
        } catch (err) {
          setErrorMessage("Failed to establish connection with the other participant");
        }
      });

      socket.on("signal", async ({ from, data }) => {
        let pc = peersRef.current[from];
        if (!pc) {
          pc = createPeerConnection(from);
        }
        try {
          if (data.sdp) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            if (data.sdp.type === "offer") {
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socket.emit("signal", { to: from, data: { sdp: answer } });
            }
          } else if (data.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (err) {
          // ignore transient signaling errors
        }
      });

      socket.on("participant-left", ({ socketId }) => {
        if (peersRef.current[socketId]) {
          peersRef.current[socketId].close();
          delete peersRef.current[socketId];
        }
        setRemoteConnected(false);
        setRemoteInfo(null);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      socket.on("participant-media-status", ({ cameraOn: remoteCam, micOn: remoteMic }) => {
        setRemoteInfo((prev) => (prev ? { ...prev, cameraOn: remoteCam, micOn: remoteMic } : prev));
      });

      socket.on("meeting-error", ({ message }) => {
        setErrorMessage(message);
      });

      joinMeetingRoom(roomCode).catch(() => {});

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    },
    [createPeerConnection, roomCode]
  );

  useEffect(() => {
    const init = async () => {
      try {
        const data = await getMeetingRoom(roomCode);
        setRoom(data.interview);
        setRole(data.role);
        setPhase("permission");
      } catch (err) {
        setErrorMessage(err?.response?.data?.message || "Unable to load this meeting");
        setPhase("error");
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  const requestPermissionsAndJoin = async (currentRole) => {
    setErrorMessage("");
    const compulsory = currentRole === "candidate";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      cameraTrackRef.current = stream.getVideoTracks()[0] || null;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCameraOn(true);
      setMicOn(true);
      setPhase("inMeeting");
      connectSocketAndSignal(room, currentRole);
    } catch (err) {
      if (compulsory) {
        setErrorMessage("Camera and microphone access are required to continue.");
        setPhase("blocked");
      } else {
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = audioOnly;
          setCameraOn(false);
          setMicOn(true);
          setPhase("inMeeting");
          connectSocketAndSignal(room, currentRole);
        } catch (audioErr) {
          localStreamRef.current = new MediaStream();
          setCameraOn(false);
          setMicOn(false);
          setPhase("inMeeting");
          connectSocketAndSignal(room, currentRole);
        }
      }
    }
  };

  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;
    if (role === "candidate") return;
    videoTrack.enabled = !videoTrack.enabled;
    setCameraOn(videoTrack.enabled);
    socketRef.current?.emit("media-status", { cameraOn: videoTrack.enabled, micOn });
  };

  const toggleMic = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;
    if (role === "candidate") return;
    audioTrack.enabled = !audioTrack.enabled;
    setMicOn(audioTrack.enabled);
    socketRef.current?.emit("media-status", { cameraOn, micOn: audioTrack.enabled });
  };

  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }
        screenTrack.onended = () => {
          stopScreenShare();
        };
        setScreenSharing(true);
        socketRef.current?.emit("screen-share-status", { sharing: true });
      } else {
        stopScreenShare();
      }
    } catch (err) {
      // user cancelled share dialog
    }
  };

  const stopScreenShare = () => {
    const camTrack = cameraTrackRef.current;
    Object.values(peersRef.current).forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
      if (sender && camTrack) sender.replaceTrack(camTrack);
    });
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    setScreenSharing(false);
    socketRef.current?.emit("screen-share-status", { sharing: false });
  };

  const handleLeave = async () => {
    try {
      await endMeetingRoom(roomCode);
    } catch (err) {
      // ignore
    }
    cleanupAll();
    if (role === "recruiter") {
      navigate("/recruiter/interviews");
    } else {
      navigate("/user/assessments");
    }
  };

  if (phase === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0E24] text-white">
        <p>Loading meeting room...</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E24] text-white gap-4">
        <p className="text-red-300">{errorMessage}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-xl bg-[#7393D3] font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (phase === "permission") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E24] text-white gap-6 px-6 text-center">
        <h1 className="text-2xl font-bold">Technical Interview</h1>
        <p className="text-gray-300 max-w-md">
          {role === "candidate"
            ? "Camera and microphone access are compulsory to join this interview."
            : "You may join with camera and microphone, or audio only."}
        </p>
        <button
          onClick={() => requestPermissionsAndJoin(role)}
          className="px-8 py-3 rounded-xl bg-[#7393D3] hover:bg-[#5E84D6] font-semibold transition"
        >
          Allow Camera &amp; Microphone
        </button>
      </div>
    );
  }

  if (phase === "blocked") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E24] text-white gap-4 px-6 text-center">
        <p className="text-red-300 text-lg font-semibold">Camera and microphone access are required to continue.</p>
        <button
          onClick={() => requestPermissionsAndJoin(role)}
          className="px-6 py-2 rounded-xl bg-[#7393D3] font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0E24] text-white flex flex-col">
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div>
          <h1 className="text-lg font-bold">{room?.job_title || "Technical Interview"}</h1>
          <p className="text-xs text-gray-400">Room {roomCode}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connectionStatus === "Connected" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
              }`}
            />
            {connectionStatus}
          </div>
          <div className="text-sm font-semibold tabular-nums">{formatDuration(elapsedSeconds)}</div>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-2 gap-4 p-6">
        <div className="relative bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px]">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <span className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-lg text-xs">
            You ({role === "recruiter" ? "Recruiter" : "Candidate"})
            {!cameraOn && " - Camera Off"}
            {!micOn && " - Mic Off"}
          </span>
        </div>
        <div className="relative bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px]">
          {remoteConnected ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <p className="text-gray-400 text-sm">
              {remoteInfo ? `Connecting to ${remoteInfo.name}...` : "Waiting for the other participant to join..."}
            </p>
          )}
          {remoteInfo && (
            <span className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-lg text-xs">
              {remoteInfo.name} ({remoteInfo.role === "recruiter" ? "Recruiter" : "Candidate"})
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 px-8 py-6 border-t border-white/10">
        <button
          onClick={toggleMic}
          disabled={role === "candidate"}
          className={`px-5 py-3 rounded-xl font-semibold transition ${
            micOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80"
          } ${role === "candidate" ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {micOn ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button
          onClick={toggleCamera}
          disabled={role === "candidate"}
          className={`px-5 py-3 rounded-xl font-semibold transition ${
            cameraOn ? "bg-white/10 hover:bg-white/20" : "bg-red-500/80"
          } ${role === "candidate" ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`px-5 py-3 rounded-xl font-semibold transition ${
            screenSharing ? "bg-[#7393D3]" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          {screenSharing ? "Stop Sharing" : "Share Screen"}
        </button>
        <button
          onClick={handleLeave}
          className="px-6 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 transition"
        >
          Leave Meeting
        </button>
      </div>

      {role === "candidate" && (
        <p className="text-center text-xs text-gray-400 pb-4">
          Camera and microphone must remain on throughout the interview.
        </p>
      )}
      {errorMessage && phase === "inMeeting" && (
        <p className="text-center text-xs text-red-300 pb-2">{errorMessage}</p>
      )}
    </div>
  );
}
