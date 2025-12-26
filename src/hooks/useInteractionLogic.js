import { database } from '../firebase';
import { ref, update, remove, get } from 'firebase/database';
import { addXP, getReactionXp } from '../utils/xpSystem';

export default function useInteractionLogic(activeGroup, currentUser, userData, getMessageSnippet) {
  
  const isManager = ['admin', 'assistant_admin', 'co_admin', 'leader', 'group_leader'].includes(userData?.role);

  const handleVote = async (msgId, optionId) => {
    const msgRef = ref(database, `groups/${activeGroup.id}/messages/${msgId}`);
    const snapshot = await get(msgRef);
    const msg = snapshot.val();
    const userId = currentUser.uid;
    const previousOptionId = msg.votes ? msg.votes[userId] : null;

    if (msg.allowVoteChange === false && previousOptionId !== undefined && previousOptionId !== null) return alert("Vote change not allowed.");

    if (previousOptionId === undefined || previousOptionId === null) {
      if (msg.isQuiz) {
        if (msg.correctOptionId === optionId) addXP(userId, 10);
        else addXP(userId, -1);
      } else {
        addXP(userId, 2);
      }
    }

    const updates = {};
    if (previousOptionId === optionId) {
        if (msg.allowVoteChange === false) return;
        const prevIdx = msg.options.findIndex(o => o.id === previousOptionId);
        if (prevIdx !== -1) updates[`groups/${activeGroup.id}/messages/${msgId}/options/${prevIdx}/voteCount`] = Math.max(0, (msg.options[prevIdx].voteCount || 0) - 1);
        updates[`groups/${activeGroup.id}/messages/${msgId}/votes/${userId}`] = null;
    } else {
        if (previousOptionId !== undefined && previousOptionId !== null) {
            const prevIdx = msg.options.findIndex(o => o.id === previousOptionId);
            if (prevIdx !== -1) updates[`groups/${activeGroup.id}/messages/${msgId}/options/${prevIdx}/voteCount`] = Math.max(0, (msg.options[prevIdx].voteCount || 0) - 1);
        }
        const newIdx = msg.options.findIndex(o => o.id === optionId);
        if (newIdx !== -1) updates[`groups/${activeGroup.id}/messages/${msgId}/options/${newIdx}/voteCount`] = (msg.options[newIdx].voteCount || 0) + 1;
        updates[`groups/${activeGroup.id}/messages/${msgId}/votes/${userId}`] = optionId;
    }
    await update(ref(database), updates);
  };

  const handleReveal = async (msgId) => {
    await update(ref(database, `groups/${activeGroup.id}/messages/${msgId}`), { isRevealed: true });
  };

  const handleReaction = async (msgId, emoji) => {
    const msgRef = ref(database, `groups/${activeGroup.id}/messages/${msgId}`);
    const snapshot = await get(msgRef);
    if (!snapshot.exists()) return;
    
    const reactionsRef = ref(database, `groups/${activeGroup.id}/messages/${msgId}/reactions`);
    const rSnapshot = await get(reactionsRef);
    const data = rSnapshot.val() || {};
    let existingEmoji = null;
    Object.keys(data).forEach(key => { if (data[key][currentUser.uid]) existingEmoji = key; });

    const updates = {};
    const reactorRole = userData?.role || 'user';
    let xpValue = (emoji === '👎') ? -5 : getReactionXp(reactorRole);

    if (existingEmoji === emoji) {
      updates[`groups/${activeGroup.id}/messages/${msgId}/reactions/${emoji}/${currentUser.uid}`] = null;
      if (snapshot.val().senderId !== currentUser.uid) addXP(snapshot.val().senderId, -xpValue);
    } else {
      if (existingEmoji) updates[`groups/${activeGroup.id}/messages/${msgId}/reactions/${existingEmoji}/${currentUser.uid}`] = null;
      else if (snapshot.val().senderId !== currentUser.uid) addXP(snapshot.val().senderId, xpValue);
      updates[`groups/${activeGroup.id}/messages/${msgId}/reactions/${emoji}/${currentUser.uid}`] = true;
    }
    await update(ref(database), updates);
  };

  const confirmDeleteAction = async (msgToDelete) => {
    if (!msgToDelete) return;
    await update(ref(database, `groups/${activeGroup.id}/messages/${msgToDelete.id}`), {
      isDeleted: true,
      deletedBy: currentUser.email.split('@')[0],
      deletedByRole: userData?.role
    });
    if (msgToDelete.senderId !== currentUser.uid) addXP(msgToDelete.senderId, -20);
  };

  // --- FIXED PIN LOGIC ---
  const handlePinAction = async (msg) => {
    if (!isManager) return;
    // CRITICAL FIX: Ensure 'text' is never undefined
    const safeText = getMessageSnippet(msg) || "📌 Pinned Message"; 
    
    await update(ref(database, `groups/${activeGroup.id}`), { 
        pinnedMessage: { 
            text: safeText, 
            sender: msg.senderEmail, 
            id: msg.id 
        } 
    });
  };

  const handleUnpinAction = async () => {
    if (!isManager) return;
    await remove(ref(database, `groups/${activeGroup.id}/pinnedMessage`));
  };

  return { handleVote, handleReveal, handleReaction, confirmDeleteAction, handlePinAction, handleUnpinAction, isManager };
}