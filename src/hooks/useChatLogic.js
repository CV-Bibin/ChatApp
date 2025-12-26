import { useState } from 'react';
import { database } from '../firebase';
import { update, ref } from 'firebase/database';
import useChatData from './useChatData'; 
import useMessageActions from './useMessageActions';
import useInteractionLogic from './useInteractionLogic';

export default function useChatLogic(activeGroup, currentUser, userData) {
  // 1. Fetch Data
  const { messages, userProfiles, pinnedMessage, isRestricted } = useChatData(activeGroup, currentUser);

  // 2. UI State
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [msgToDelete, setMsgToDelete] = useState(null);
  const [msgToForward, setMsgToForward] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);

  // 3. Logic Hooks
  const { 
    handleSendMessage, handleFileUpload, 
    handleSendAudio, handleCreatePoll, handleForwardAction, getMessageSnippet 
  } = useMessageActions(activeGroup, currentUser, userData);

  const { 
    handleVote, handleReveal, handleReaction, confirmDeleteAction, 
    handlePinAction, handleUnpinAction, isManager 
  } = useInteractionLogic(activeGroup, currentUser, userData, getMessageSnippet);

  // 4. Wrappers (Connecting UI state to Logic)
  const onSendMessage = async (text) => {
    const wasEdit = await handleSendMessage(text, replyTo, editingMessage);
    if (wasEdit) setEditingMessage(null);
    else setReplyTo(null);
  };

  const onForward = async (targetGroupIds) => {
    await handleForwardAction(msgToForward, targetGroupIds);
    setMsgToForward(null);
  };

  const onDeleteConfirm = async () => {
    await confirmDeleteAction(msgToDelete);
    setMsgToDelete(null);
  };

  const handleDeleteClick = (msg) => {
    const myRole = userData?.role;
    const senderRole = msg.senderRole;
    const isMe = msg.senderId === currentUser.uid;
    
    if (senderRole === 'admin' && myRole !== 'admin') return alert("Cannot delete Main Admin message.");
    
    let canDelete = isMe || 
                    ['admin', 'co_admin', 'assistant_admin'].includes(myRole) || 
                    (['leader', 'group_leader'].includes(myRole) && senderRole === 'rater');

    if (!canDelete) return alert("Permission denied.");
    setMsgToDelete(msg);
  };

  // 5. Return Public API
  return {
    // Data & State
    messages, pinnedMessage, isRestricted, isManager, userProfiles,
    replyTo, setReplyTo, editingMessage, setEditingMessage,
    msgToDelete, setMsgToDelete, msgToForward, setMsgToForward,
    showPollModal, setShowPollModal,
    
    // Actions
    handleSendMessage: onSendMessage,
    handleForwardAction: onForward,
    confirmDeleteAction: onDeleteConfirm,
    handleDeleteClick,
    
    // Pass-through functions
    handleFileUpload, handleSendAudio, handleCreatePoll, 
    handleVote, handleReveal, handleReaction, 
    handlePin: handlePinAction,
    handleUnpin: handleUnpinAction,
    
    toggleRestriction: async () => isManager && update(ref(database, `groups/${activeGroup.id}`), { restricted: !isRestricted })
  };
}