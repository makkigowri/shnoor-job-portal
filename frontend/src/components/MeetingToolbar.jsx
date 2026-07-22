import React from 'react';
import { useTrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaDesktop, 
  FaPhoneSlash 
} from 'react-icons/fa6';
export default function MeetingToolbar({ onLeave }) {
  const { toggle: toggleCam, enabled: isCamOn } = useTrackToggle({ source: Track.Source.Camera });
  const { toggle: toggleMic, enabled: isMicOn } = useTrackToggle({ source: Track.Source.Microphone });
  const { toggle: toggleScreen, enabled: isScreenOn } = useTrackToggle({ source: Track.Source.ScreenShare });
  return (
    <div className="flex items-center gap-4 px-6 py-4 bg-white border border-gray-200 rounded-full shadow-lg">
      <button
        onClick={() => toggleMic()}
        style={{
          backgroundColor: isMicOn ? '#3E3A74' : '#7393D3',
        }}
        className="p-3.5 rounded-full text-white transition-all duration-200 hover:opacity-90 shadow-md shadow-gray-200"
        title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
      >
        {isMicOn ? <FaMicrophone className="w-5 h-5" /> : <FaMicrophoneSlash className="w-5 h-5" />}
      </button>
      <button
        onClick={() => toggleCam()}
        style={{
          backgroundColor: isCamOn ? '#3E3A74' : '#7393D3',
        }}
        className="p-3.5 rounded-full text-white transition-all duration-200 hover:opacity-90 shadow-md shadow-gray-200"
        title={isCamOn ? 'Turn Camera Off' : 'Turn Camera On'}
      >
        {isCamOn ? <FaVideo className="w-5 h-5" /> : <FaVideoSlash className="w-5 h-5" />}
      </button>
      <button
        onClick={() => toggleScreen()}
        style={{
          backgroundColor: isScreenOn ? '#3E3A74' : '#e5e7eb', 
          color: isScreenOn ? '#ffffff' : '#3E3A74' 
        }}
        className="p-3.5 rounded-full transition-all duration-200 hover:opacity-90 shadow-md shadow-gray-100"
        title={isScreenOn ? 'Stop Presenting' : 'Present Screen'}
      >
        <FaDesktop className="w-5 h-5" />
      </button>     
      <div className="w-px h-6 bg-gray-200 mx-1" />
      <button
        onClick={onLeave}
        style={{
          backgroundColor: '#3E3A74' 
        }}
        className="px-5 py-3 rounded-full text-white font-medium hover:opacity-90 transition-all duration-200 flex items-center gap-2 shadow-md shadow-gray-200"
        title="Leave Interview"
      >
        <FaPhoneSlash className="w-4 h-4" />
        <span className="text-sm">End Call</span>
      </button>
      
    </div>
  );
}