import { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { checkInactivityPenalty } from '../utils/xpSystem';

export default function useChatData(activeGroup, currentUser) {
  const [messages, setMessages] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [isRestricted, setIsRestricted] = useState(false);

  // --- 1. FETCH LIVE USER DATA ---
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) setUserProfiles(snapshot.val());
    });
    return () => unsubUsers();
  }, []);

  // --- 2. INIT & INACTIVITY CHECK ---
  useEffect(() => {
    if (currentUser) {
      checkInactivityPenalty(currentUser.uid);
    }
  }, [currentUser]);

  // --- 3. FETCH GROUP MESSAGES & SETTINGS ---
  useEffect(() => {
    if (!activeGroup?.id) return;
    
    // Listen for Messages
    const messagesRef = ref(database, `groups/${activeGroup.id}/messages`);
    const unsubMsg = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      setMessages(data ? Object.entries(data).map(([key, val]) => ({ id: key, ...val })) : []);
    });

    // Listen for Group Settings (Pin/Restrict)
    const groupRef = ref(database, `groups/${activeGroup.id}`);
    const unsubGroup = onValue(groupRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPinnedMessage(data.pinnedMessage || null);
        setIsRestricted(data.restricted || false);
      }
    });

    return () => { unsubMsg(); unsubGroup(); };
  }, [activeGroup]);

  // --- 4. HANDLE READ RECEIPTS ---
  useEffect(() => {
    if (!activeGroup?.id || !currentUser || messages.length === 0) return;

    const updates = {};
    messages.forEach(msg => {
      if (msg.senderId !== currentUser.uid && (!msg.readBy || !msg.readBy[currentUser.uid])) {
         updates[`groups/${activeGroup.id}/messages/${msg.id}/readBy/${currentUser.uid}`] = Date.now();
      }
    });

    if (Object.keys(updates).length > 0) {
      update(ref(database), updates);
    }
  }, [messages, activeGroup, currentUser]);

  // Return data to be used by the main logic hook
  return { messages, userProfiles, pinnedMessage, isRestricted };
}