import React, { useState } from "react";
import { X, Plus, CheckCircle, BarChart2, Trash2 } from "lucide-react";

export default function CreatePollModal({ isOpen, onClose, onCreate }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [isQuiz, setIsQuiz] = useState(false);
  const [allowVoteChange, setAllowVoteChange] = useState(true);

  if (!isOpen) return null;

  /* ---------------- OPTION HANDLERS ---------------- */

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 5) setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;

    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);

    if (correctOptionIndex === index) setCorrectOptionIndex(null);
    else if (correctOptionIndex !== null && index < correctOptionIndex) {
      setCorrectOptionIndex(correctOptionIndex - 1);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = (e) => {
    e.preventDefault();

    const validOptions = options.filter((o) => o.trim() !== "");

    if (!question.trim()) return alert("Please enter a question");
    if (validOptions.length < 2) return alert("At least 2 options required");
    if (isQuiz && correctOptionIndex === null)
      return alert("Select the correct answer");

    const pollData = {
      question,
      options: validOptions.map((text, i) => ({
        id: i,
        text,
        voteCount: 0,
      })),
      isQuiz,
      correctOptionId: isQuiz ? correctOptionIndex : null,
      isRevealed: false,
      allowVoteChange: isQuiz ? false : allowVoteChange,
      createdAt: Date.now(),
    };

    onCreate(pollData);

    // Reset Form
    setQuestion("");
    setOptions(["", ""]);
    setIsQuiz(false);
    setCorrectOptionIndex(null);
    setAllowVoteChange(true);
    onClose();
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <BarChart2 className="text-blue-500" /> Create Poll
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X />
          </button>
        </div>

        {/* CONTENT FORM */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1">

          {/* QUESTION */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
              Question
            </label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something..."
              className="w-full bg-gray-50 border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              autoFocus
            />
          </div>

          {/* OPTIONS */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase block">
              Options
            </label>

            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center group">
                <input
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className={`flex-1 bg-gray-50 border rounded-xl p-3 text-sm focus:ring-2 transition outline-none
                    ${isQuiz && correctOptionIndex === idx
                      ? "border-green-500 ring-1 ring-green-500 bg-green-50"
                      : "border-gray-200 focus:ring-blue-500"
                    }`}
                />

                {/* Mark Correct Answer (Quiz Mode) */}
                {isQuiz && (
                  <button
                    type="button"
                    onClick={() => setCorrectOptionIndex(idx)}
                    className={`p-3 rounded-xl border transition
                      ${correctOptionIndex === idx
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-300 border-gray-200 hover:text-green-500"
                      }`}
                    title="Mark as correct answer"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}

                {/* Delete Option */}
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    title="Remove option"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            {options.length < 5 && (
              <button
                type="button"
                onClick={addOption}
                className="text-sm text-blue-600 font-bold flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-xl transition"
              >
                <Plus size={16} /> Add Option
              </button>
            )}
          </div>

          {/* SETTINGS */}
          <div className="p-4 bg-gray-50 rounded-2xl border space-y-4">

            {/* QUIZ TOGGLE */}
            <div className="flex justify-between items-center cursor-pointer" onClick={() => {
                setIsQuiz(!isQuiz);
                if (!isQuiz) setAllowVoteChange(false);
                else setCorrectOptionIndex(null);
            }}>
              <div>
                <p className="text-sm font-bold text-gray-700">Quiz Mode</p>
                <p className="text-xs text-gray-400">Select one correct answer</p>
              </div>
              <div className={`w-11 h-6 rounded-full p-1 transition duration-200 ${isQuiz ? "bg-green-500" : "bg-gray-300"}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition transform duration-200 ${isQuiz ? "translate-x-5" : ""}`} />
              </div>
            </div>

            {/* ALLOW CHANGE TOGGLE */}
            {!isQuiz && (
              <div className="flex justify-between items-center border-t pt-3 cursor-pointer" onClick={() => setAllowVoteChange(!allowVoteChange)}>
                <div>
                  <p className="text-sm font-bold text-gray-700">Allow Vote Change</p>
                  <p className="text-xs text-gray-400">Users can change their vote</p>
                </div>
                <div className={`w-11 h-6 rounded-full p-1 transition duration-200 ${allowVoteChange ? "bg-blue-500" : "bg-gray-300"}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition transform duration-200 ${allowVoteChange ? "translate-x-5" : ""}`} />
                </div>
              </div>
            )}
          </div>

          {/* HIDDEN SUBMIT (For Enter Key) */}
          <input type="submit" hidden />
        </form>

        {/* FOOTER */}
        <div className="pt-6 border-t mt-auto">
          <button
            onClick={handleSubmit}
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-2xl hover:bg-black transition shadow-lg hover:shadow-xl transform active:scale-[0.98]"
          >
            Create Poll
          </button>
        </div>

      </div>
    </div>
  );
}