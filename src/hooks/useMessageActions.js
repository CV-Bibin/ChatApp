import { database } from '../firebase';
import { ref, push, set, update, remove } from 'firebase/database';
import { addXP } from '../utils/xpSystem';

const CLOUD_NAME = "dkfy7dsal"; 
const UPLOAD_PRESET = "chat_media"; 

export default function useMessageActions(activeGroup, currentUser, userData) {

  // Helper to safely get text for replies/pinning
  const getMessageSnippet = (msg) => {
    if (msg.text) return msg.text;
    if (msg.type === 'image') return "📷 Image";
    if (msg.type === 'video') return "🎥 Video";
    if (msg.type === 'audio') return "🎵 Audio";
    if (msg.type === 'file') return `📁 ${msg.fileName || "File"}`;
    if (msg.type === 'poll') return "📊 Poll";
    return "Message";
  };

  const handleSendMessage = async (text, replyTo, editingMessage) => {
    if (editingMessage) {
        const updates = {};
        updates[`groups/${activeGroup.id}/messages/${editingMessage.id}/text`] = text;
        updates[`groups/${activeGroup.id}/messages/${editingMessage.id}/isEdited`] = true;
        updates[`groups/${activeGroup.id}/messages/${editingMessage.id}/editHistory/${Date.now()}`] = editingMessage.text;
        await update(ref(database), updates);
        return true;
    }

    const chatRef = ref(database, `groups/${activeGroup.id}/messages`);
    const newMsg = {
      text,
      senderId: currentUser.uid,
      senderEmail: currentUser.email,
      senderRole: userData?.role || 'user',
      senderXp: userData?.xp || 0,
      createdAt: Date.now()
    };

    if (replyTo) {
      newMsg.replyTo = {
        id: replyTo.id,
        text: getMessageSnippet(replyTo), // Safe snippet
        sender: replyTo.senderEmail.split('@')[0]
      };
    }
    await set(push(chatRef), newMsg);
    addXP(currentUser.uid, 1);
    return false;
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // 1. Create a "Placeholder" message immediately
    const chatRef = ref(database, `groups/${activeGroup.id}/messages`);
    const newMsgRef = push(chatRef);
    
    // Guess type for icon
    let tempType = 'file';
    if (file.type.startsWith('image/')) tempType = 'image';
    if (file.type.startsWith('video/')) tempType = 'video';

    const tempMsg = {
        type: tempType,
        isUploading: true, // <--- Flag for UI
        fileName: file.name,
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderRole: userData?.role || 'user',
        senderXp: userData?.xp || 0,
        createdAt: Date.now()
    };

    // Show it in chat immediately
    await set(newMsgRef, tempMsg);

    try {
        // 2. Start Upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET); 
        formData.append("cloud_name", CLOUD_NAME);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
            method: "POST", body: formData
        });
        const data = await res.json();

        if (data.secure_url) {
            // 3. Update placeholder with real data
            let finalType = 'file';
            if (data.resource_type === 'image') finalType = 'image';
            if (data.resource_type === 'video') finalType = 'video';
            if (file.name.toLowerCase().endsWith('.pdf')) finalType = 'file';

            const fileSize = (file.size / (1024 * 1024));
            const sizeStr = fileSize < 1 ? (file.size / 1024).toFixed(0) + " KB" : fileSize.toFixed(2) + " MB";

            await update(newMsgRef, {
                mediaUrl: data.secure_url,
                type: finalType,
                fileSize: sizeStr,
                isUploading: null // Remove loading flag
            });
            addXP(currentUser.uid, 5); 
        } else {
             // Upload failed, remove placeholder
             console.error("Cloudinary Error:", data);
             alert("Upload failed.");
             remove(newMsgRef);
        }
    } catch (error) {
        console.error("Upload network error:", error);
        alert("Upload failed.");
        remove(newMsgRef);
    }
  };

  const handleSendAudio = (audioBlob) => {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const chatRef = ref(database, `groups/${activeGroup.id}/messages`);
      const newMsg = {
        type: 'audio',
        audioUrl: reader.result,
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderRole: userData?.role || 'user',
        senderXp: userData?.xp || 0,
        createdAt: Date.now()
      };
      await set(push(chatRef), newMsg);
      addXP(currentUser.uid, 3);
    };
  };

  const handleCreatePoll = async (pollData) => {
    const chatRef = ref(database, `groups/${activeGroup.id}/messages`);
    const newMsg = {
      type: 'poll', ...pollData,
      senderId: currentUser.uid, senderEmail: currentUser.email,
      senderRole: userData?.role || 'user', senderXp: userData?.xp || 0,
      createdAt: Date.now()
    };
    await set(push(chatRef), newMsg);
    addXP(currentUser.uid, 2);
  };

  const handleForwardAction = async (msgToForward, targetGroupIds) => {
    if (!msgToForward) return;
    for (const groupId of targetGroupIds) {
        const chatRef = ref(database, `groups/${groupId}/messages`);
        const newMsg = {
            senderId: currentUser.uid,
            senderEmail: currentUser.email,
            senderRole: userData?.role || 'user',
            senderXp: userData?.xp || 0,
            createdAt: Date.now(),
            isForwarded: true,
        };
        
        newMsg.type = msgToForward.type || 'text';
        if (msgToForward.type === 'poll') {
            newMsg.question = msgToForward.question;
            newMsg.isQuiz = msgToForward.isQuiz || false;
            if(msgToForward.isQuiz) newMsg.correctOptionId = msgToForward.correctOptionId;
            newMsg.options = msgToForward.options.map(opt => ({ id: opt.id, text: opt.text, voteCount: 0 }));
        } else if (msgToForward.type === 'audio') {
            newMsg.audioUrl = msgToForward.audioUrl;
        } else if (['image', 'video', 'file'].includes(msgToForward.type)) {
            newMsg.mediaUrl = msgToForward.mediaUrl;
            newMsg.fileName = msgToForward.fileName || "File";
            newMsg.fileSize = msgToForward.fileSize || "";
        } else {
            newMsg.text = msgToForward.text || "";
        }
        await set(push(chatRef), newMsg);
    }
  };

  return { handleSendMessage, handleFileUpload, handleSendAudio, handleCreatePoll, handleForwardAction, getMessageSnippet };
}