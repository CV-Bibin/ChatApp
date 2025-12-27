import React from 'react';
import { CheckCircle, XCircle, BarChart2, Eye, Lock } from 'lucide-react';

export default function PollMessage({ msg, currentUser, onVote, onReveal }) {
  // 1. EXTRACT DATA CORRECTLY
  const poll = msg.poll || {}; // <--- FIX: Read from 'poll' object
  
  const options = poll.options || [];
  const totalVotes = options.reduce((acc, opt) => acc + (opt.voteCount || 0), 0);
  
  // 2. CHECK VOTES (from poll.votes, not msg.votes)
  const userVoteOptionId = poll.votes ? poll.votes[currentUser.uid] : null; 
  const hasVoted = userVoteOptionId !== undefined && userVoteOptionId !== null;

  // 3. REVEAL LOGIC
  const canReveal = (msg.senderId === currentUser.uid || currentUser.role === 'admin') && poll.isQuiz && !poll.isRevealed;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm w-full min-w-[250px] max-w-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-bold text-gray-800 text-sm leading-tight">{poll.question}</h4>
        <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg shrink-0">
          <BarChart2 size={16} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            {poll.isQuiz ? "Quiz Mode" : "Public Poll"}
        </span>
        <span className="text-[10px] text-gray-300">•</span>
        <span className="text-[10px] text-gray-500 font-medium">{totalVotes} votes</span>
      </div>

      {/* Options List */}
      <div className="space-y-2">
        {options.map((opt) => {
          const percentage = totalVotes === 0 ? 0 : Math.round(((opt.voteCount || 0) / totalVotes) * 100);
          const isSelected = userVoteOptionId === opt.id;
          
          // Styling Logic
          let statusColor = "bg-white border-gray-200"; 
          let progressColor = "bg-gray-100"; 
          let textColor = "text-gray-700";
          let icon = null;

          // REVEALED STATE (Quiz Answer)
          if (poll.isRevealed) {
            if (opt.id === poll.correctOptionId) {
              // This is the Correct Answer
              statusColor = "border-green-500 bg-green-50";
              progressColor = "bg-green-200";
              icon = <CheckCircle size={14} className="text-green-600" />;
            } else if (isSelected) {
              // User picked Wrong Answer
              statusColor = "border-red-300 bg-red-50";
              progressColor = "bg-red-200";
              icon = <XCircle size={14} className="text-red-500" />;
            }
          } 
          // VOTED STATE (Hidden Result)
          else if (isSelected) {
             statusColor = "border-blue-500 bg-blue-50";
             progressColor = "bg-blue-200";
             textColor = "text-blue-700";
             icon = <CheckCircle size={14} className="text-blue-600" />;
          }

          return (
            <button 
              key={opt.id}
              // Disable if user voted AND change is not allowed
              disabled={hasVoted && !poll.allowVoteChange}
              onClick={() => onVote(msg.id, opt.id)}
              className={`relative w-full text-left p-2.5 rounded-xl border transition-all duration-200 overflow-hidden group 
                ${hasVoted && !poll.allowVoteChange ? 'cursor-default' : 'hover:border-blue-300 active:scale-[0.98] cursor-pointer'} 
                ${statusColor}`}
            >
              {/* Progress Bar Background */}
              {hasVoted && (
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-500 opacity-50 ${progressColor}`} 
                  style={{ width: `${percentage}%` }}
                />
              )}

              {/* Option Text & Icons */}
              <div className="relative z-10 flex justify-between items-center text-sm">
                <span className={`font-semibold flex items-center gap-2 ${textColor}`}>
                   {opt.text}
                   {icon}
                </span>
                
                {hasVoted && <span className="text-xs font-bold text-gray-500">{percentage}%</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Admin / Creator Reveal Button */}
      {canReveal && (
        <button 
          onClick={() => onReveal(msg.id)}
          className="mt-4 w-full py-2 bg-gray-900 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-black transition shadow-lg"
        >
          <Eye size={14} /> Reveal Answer
        </button>
      )}

      {/* Footer Info */}
      <div className="mt-2 flex justify-between items-center px-1">
         {!hasVoted ? (
             <p className="text-[10px] text-gray-400 italic">Select an option to vote</p>
         ) : (
             <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                 <CheckCircle size={10} /> Vote Recorded
             </p>
         )}
         {hasVoted && !poll.allowVoteChange && (
             <p className="text-[10px] text-gray-400 flex items-center gap-1"><Lock size={10} /> Locked</p>
         )}
      </div>
    </div>
  );
}