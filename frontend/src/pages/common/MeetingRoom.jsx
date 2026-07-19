import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer, useChat } from '@livekit/components-react';
import { Track } from 'livekit-client';
import MeetingToolbar from '../../components/MeetingToolbar';

export default function MeetingRoom() {
  const { roomName } = useParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [livekitUrl, setLivekitUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [timeElapsed, setTimeElapsed] = useState(0);

  const [userContext, setUserContext] = useState({
    fullname: 'Authorized Candidate',
    role: 'Jobseeker'
  });

  
  const [activePanel, setActivePanel] = useState(null); 

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchMeetingCredentials = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const storedToken = localStorage.getItem('shnoor_token');
        if (!storedToken) {
          throw new Error('Authentication session token is missing. Please log in first.');
        }

        const storedUser = localStorage.getItem('shnoor_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUserContext({
              fullname: parsed.fullname || parsed.full_name || 'Authorized User',
              role: parsed.role || 'Participant'
            });
          } catch (_) {}
        }

        const response = await fetch(`/api/meeting/join/${roomName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (!response.ok) {
          let msg = `Request failed: ${response.status}`;
          try {
            const errData = await response.json();
            msg = errData.message || msg;
          } catch (_) {}
          throw new Error(msg);
        }

        const data = await response.json();
        if (!data.success || !data.token || !data.url) {
          throw new Error('Failed to generate valid secure meeting tokens.');
        }

        setToken(data.token);
        setLivekitUrl(data.url);
        setConnectionStatus('connected');
      } catch (err) {
        console.error('Handshake Failure:', err);
        setError(err.message);
        setConnectionStatus('failed');
      } finally {
        setIsLoading(false);
      }
    };

    if (roomName) {
      fetchMeetingCredentials();
    }
  }, [roomName]);

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 style={{ borderColor: '#3E3A74' }} border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600 font-medium">Securing connection to room tunnel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Blocked</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">{error}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.location.reload()}
              style={{ backgroundColor: '#3E3A74' }}
              className="w-full py-3 text-white rounded-xl font-medium hover:opacity-90 transition"
            >
              Retry Connection Sync
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'rgb(250, 250, 250)' }} className="flex flex-col h-screen font-sans overflow-hidden">
      
      <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <div style={{ backgroundColor: '#3E3A74' }} className="w-8 h-8 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 style={{ color: '#3E3A74' }} className="text-large font-bold tracking-wide">SHNOOR</h1>
            <p className="text-[15px] text-gray-400 font-semibold tracking-wider uppercase">Meet</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div style={{ backgroundColor: '#eef2ff', color: '#3E3A74', borderColor: '#7393D3' }} className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold">
            <span style={{ backgroundColor: '#3E3A74' }} className="w-2 h-2 rounded-full animate-pulse" />
            {connectionStatus === 'connected' ? 'Live' : 'Reconnecting'}
          </div>

          <div style={{ color: '#3E3A74' }} className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-wider">
            {formatTime(timeElapsed)}
          </div>

          <div className="h-6 w-[1px] bg-gray-200" />

          
          <button 
            onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
            className={`p-2 rounded-full transition-all duration-200 ${activePanel === 'chat' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

         
          <button 
            onClick={() => setActivePanel(activePanel === 'participants' ? null : 'participants')}
            className={`p-2 rounded-full transition-all duration-200 ${activePanel === 'participants' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </header>

     
      <div className="flex flex-1 overflow-hidden relative">
        <LiveKitRoom
          token={token}
          serverUrl={livekitUrl}
          connect={true}
          video={true}
          audio={true}
          onDisconnected={handleDisconnect}
          className="flex-1 flex flex-row relative h-full w-full overflow-hidden"
        >
         
          <div className="flex-1 flex flex-col relative p-4 sm:p-6 min-w-0 transition-all duration-300">
            <div className="flex-1 flex items-center justify-center w-full h-full pb-24">
              <MeetingGrid />
            </div>

            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
              <MeetingToolbar onLeave={handleDisconnect} />
            </div>
          </div>

          <RoomAudioRenderer />

          
          <MeetingSidePanel activePanel={activePanel} onClose={() => setActivePanel(null)} />
        </LiveKitRoom>
      </div>
    </div>
  );
}

function MeetingGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false }
    ],
    { onlySubscribed: false }
  );

  const tileCount = tracks.length;
  const screenShareTrack = tracks.find(t => t.source === Track.Source.ScreenShare);
  const isScreenSharing = !!screenShareTrack;
  const cameraTracks = tracks.filter(t => t.source === Track.Source.Camera);

  if (tileCount === 0) {
    return (
      <div className="text-center p-8 bg-white/60 backdrop-blur border border-gray-100 rounded-3xl max-w-sm mx-auto">
        <div style={{ backgroundColor: '#eef2ff' }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg style={{ color: '#3E3A74' }} className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-md font-bold text-gray-900">Configuring hardware devices...</h3>
      </div>
    );
  }

 
  if (isScreenSharing) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 w-full h-full items-stretch transition-all duration-500 ease-out">
        <div className="flex-[3.5] bg-gray-950 rounded-2xl border border-gray-200 overflow-hidden relative aspect-video lg:aspect-auto flex items-center justify-center">
          <VideoTrack trackRef={screenShareTrack} className="w-full h-full object-contain" />
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            {screenShareTrack.participant.name || screenShareTrack.participant.identity || 'User'}'s Screen
          </div>
        </div>

        <div className="flex-1 lg:max-w-[22%] flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto pr-1 pb-2 lg:pb-0 content-start">
          {cameraTracks.map((track) => (
            <div key={`${track.participant.sid}-${track.source}`} className="w-48 sm:w-60 lg:w-full shrink-0 aspect-video">
              <VideoTile track={track} />
            </div>
          ))}
        </div>
      </div>
    );
  }

 
  let gridClasses = "grid gap-4 w-full h-full transition-all duration-300 items-center justify-center ";
  if (tileCount === 1) {
    gridClasses += "grid-cols-1 max-w-4xl aspect-video mx-auto";
  } else if (tileCount === 2) {
    gridClasses += "grid-cols-1 md:grid-cols-2 max-w-5xl aspect-video md:aspect-auto";
  } else if (tileCount <= 4) {
    gridClasses += "grid-cols-2 max-w-5xl aspect-video sm:aspect-auto";
  } else if (tileCount <= 6) {
    gridClasses += "grid-cols-2 lg:grid-cols-3 max-w-6xl";
  } else {
    gridClasses += "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 w-full";
  }

  return (
    <div className={gridClasses}>
      {tracks.map((track) => (
        <div key={`${track.participant.sid}-${track.source}`} className="w-full h-full flex items-center justify-center aspect-video">
          <VideoTile track={track} />
        </div>
      ))}
    </div>
  );
}

function VideoTile({ track }) {
  const name = track.participant.name || track.participant.identity || 'User';
  const firstLetter = name.charAt(0).toUpperCase();
  const isCamOff = track.source === Track.Source.Camera && !track.participant.isCameraEnabled;
  const isMicOff = !track.participant.isMicrophoneEnabled;
  const isSpeaking = track.participant.isSpeaking;

  return (
    <div className={`relative w-full h-full bg-gray-950 border transition-all duration-300 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center group hover:shadow-md ${isSpeaking ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200'}`}>
      {isCamOff ? (
        <div 
          style={{ backgroundColor: '#3E3A74', borderColor: '#3E3A74' }} 
          className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg uppercase"
        >
          {firstLetter}
        </div>
      ) : (
        <VideoTrack trackRef={track} className="w-full h-full object-cover rounded-2xl" />
      )}

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-medium text-white flex items-center gap-1.5 max-w-[80%] truncate">
          <span className={`w-1.5 h-1.5 rounded-full ${isCamOff ? 'bg-gray-400' : 'bg-emerald-500'}`} />
          <span className="truncate">{name}</span>
        </div>
        <div className={`p-1.5 rounded-xl backdrop-blur-md shadow-sm ${isMicOff ? 'bg-red-500/80 text-white' : 'bg-black/60 text-emerald-400'}`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            {isMicOff && <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />}
          </svg>
        </div>
      </div>
    </div>
  );
}


function MeetingSidePanel({ activePanel, onClose }) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });
  
  
  const { send, chatMessages } = useChat();
  const [msgText, setMsgText] = useState('');

  if (!activePanel) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;

    try {
      if (send) {
        await send(msgText.trim());
        setMsgText('');
      }
    } catch (err) {
      console.error("Message transmission failure:", err);
    }
  };

  return (
    <aside className="w-full sm:w-[350px] bg-white border-l border-gray-200 h-full flex flex-col shrink-0 z-40 transition-all duration-300">
      <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          {activePanel === 'chat' ? 'Chat' : `Participants (${tracks.length})`}
        </h2>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {activePanel === 'chat' ? (
          <div className="flex flex-col gap-3 min-h-full justify-between">
            <div className="space-y-3">
              {chatMessages.map((msg, index) => (
                <div key={msg.id || index} className={`flex flex-col ${msg.from?.isLocal ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-gray-400 font-medium mb-0.5 px-1">
                    {msg.from?.name || msg.from?.identity || 'Participant'}
                  </span>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${msg.from?.isLocal ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track) => {
              const pName = track.participant.name || track.participant.identity || 'User';
              const pInitial = pName.charAt(0).toUpperCase();
              const pMicOff = !track.participant.isMicrophoneEnabled;
              const pCamOff = !track.participant.isCameraEnabled;

              return (
                <div key={track.participant.sid} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div style={{ backgroundColor: '#7393D3' }} className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {pInitial}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 truncate">{pName}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className={`p-1 rounded-lg ${pMicOff ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50'}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        {pMicOff && <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />}
                      </svg>
                    </div>
                    <div className={`p-1 rounded-lg ${pCamOff ? 'text-red-500 bg-red-50' : 'text-emerald-500 bg-emerald-50'}`}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        {pCamOff && <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />}
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activePanel === 'chat' && (
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-gray-50 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800"
          />
          <button 
            type="submit" 
            style={{ backgroundColor: '#3E3A74' }}
            className="p-1.5 rounded-xl text-white hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      )}
    </aside>
  );
}