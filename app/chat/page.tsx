"use client";

import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, newMessage] }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Voice input
  const startListening = () => {
    const recognition = new (window.SpeechRecognition ||
      (window as any).webkitSpeechRecognition)();
    recognition.lang = "hi-IN";
    recognition.start();

    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
    };
  };

  // Voice output
  const speak = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[70%] ${
              msg.role === "user"
                ? "bg-blue-600 self-end ml-auto"
                : "bg-gray-700 self-start mr-auto"
            }`}
          >
            {msg.content}
            {msg.role === "assistant" && (
              <button
                className="ml-2 text-sm text-yellow-400"
                onClick={() => speak(msg.content)}
              >
                🔊
              </button>
            )}
          </div>
        ))}
        {loading && <p className="text-gray-400">Thinking...</p>}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-gray-800 flex items-center">
        <input
          className="flex-1 p-2 rounded-lg text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="ml-2 bg-blue-500 px-3 py-2 rounded-lg"
          onClick={sendMessage}
        >
          Send
        </button>
        <button
          className="ml-2 bg-green-500 px-3 py-2 rounded-lg"
          onClick={startListening}
        >
          🎤
        </button>
      </div>
    </div>
  );
}
