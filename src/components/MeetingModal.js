import React, { useEffect, useRef, useState } from 'react';
import { X, Video } from 'lucide-react';
import { database } from '../firebase';
// 1. IMPORT 'update'
import { ref, push, set, serverTimestamp, update } from 'firebase/database';

export default function MeetingModal({ isOpen, onClose, groupId, groupName, currentUser }) {
  const jitsiContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const notificationSentRef = useRef(false);
  // 2. NEW REF: To remember which message ID we sent
  const meetingMessageIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !groupId) {
        notificationSentRef.current = false;
        return;
    }

    // --- SEND "STARTED" NOTIFICATION ---
    const sendMeetingNotification = async () => {
        if (notificationSentRef.current) return;
        
        try {
            const messagesRef = ref(database, `groups/${groupId}/messages`);
            const newMessageRef = push(messagesRef);
            
            // Save the ID so we can edit it later
            meetingMessageIdRef.current = newMessageRef.key;
            
            await set(newMessageRef, {
                senderId: currentUser.uid,
                senderEmail: currentUser.email,
                type: 'text', 
                // Initial Text
                text: "📞 I have started a Video Meeting. Click the video icon 📹 at the top to join!",
                createdAt: serverTimestamp(),
                isSystemMessage: true 
            });
            
            notificationSentRef.current = true;
        } catch (error) {
            console.error("Failed to send meeting notification", error);
        }
    };

    // --- UPDATE TO "ENDED" NOTIFICATION ---
    const endMeetingNotification = async () => {
        // Only run if we actually sent a start message and have its ID
        if (meetingMessageIdRef.current) {
            try {
                const messagePath = `groups/${groupId}/messages/${meetingMessageIdRef.current}`;
                await update(ref(database, messagePath), {
                    // Change the text to show it's over
                    text: "🔴 Video Meeting Ended.",
                    // Optional: You could add a flag to style it gray/inactive
                    isMeetingEnded: true 
                });
                meetingMessageIdRef.current = null; // Reset
            } catch (error) {
                console.error("Failed to update meeting status", error);
            }
        }
    };

    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        startConference();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = startConference;
      document.body.appendChild(script);
    };

    const startConference = () => {
      setLoading(false);
      sendMeetingNotification();

      try {
        const domain = 'jitsi.riot.im'; 
        const cleanGroupName = groupName.replace(/[^a-zA-Z0-9]/g, '');
        const uniqueRoomName = `VivekApp_${cleanGroupName}_${groupId}`; 

        const options = {
          roomName: uniqueRoomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: currentUser.displayName || currentUser.email.split('@')[0]
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinPageEnabled: false, 
            disableDeepLinking: true, 
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'desktop', 'fullscreen',
              'hangup', 'profile', 'chat', 'raisehand', 
              'videoquality', 'tileview', 'select-background'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);

        api.addEventListener('videoConferenceLeft', () => {
          onClose(); // This triggers the cleanup function below
          api.dispose();
        });
        
        api.addEventListener('readyToClose', () => {
            onClose();
            api.dispose();
        });

      } catch (error) {
        console.error("Jitsi Error:", error);
      }
    };

    loadJitsiScript();

    // --- CLEANUP FUNCTION (Runs when modal closes) ---
    return () => {
      if (jitsiContainerRef.current) jitsiContainerRef.current.innerHTML = "";
      // 3. CALL THE UPDATE FUNCTION HERE
      endMeetingNotification();
    };
  }, [isOpen, groupId, groupName, currentUser]); // Removed onClose from dependency to prevent loops

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full h-full max-w-6xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg text-white">
                    <Video size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-lg">Meeting: {groupName}</h2>
                    <p className="text-xs text-green-400 font-medium">● Live Secure Connection</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                <X size={24} />
            </button>
        </div>

        {/* Jitsi Container */}
        <div className="flex-1 bg-black relative group">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                    Connecting to Server...
                </div>
            )}
            <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}