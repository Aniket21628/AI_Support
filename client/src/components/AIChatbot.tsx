import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { trpc } from "../../lib/trpc";

const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL!);

export default function Chatbot() {
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([]);
  const [input, setInput] = useState("");
  const escalate = trpc.chat.escalate.useMutation();

  useEffect(() => {
    socket.on("bot_response", (data) => {
      setMessages((prev) => [...prev, { text: data.message, isBot: true }]);
    });

    return () => {
      socket.off("bot_response");
    };
  }, []);

  const handleSend = () => {
    setMessages((prev) => [...prev, { text: input, isBot: false }]);
    socket.emit("user_message", { message: input });
    setInput("");
  };

  const handleEscalate = async () => {
    await escalate.mutateAsync({ messages });
  };

  return (
    <div className="flex flex-col h-[400px] border rounded">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.isBot ? "text-blue-600" : "text-gray-800"}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <Button onClick={handleSend}>Send</Button>
        <Button onClick={handleEscalate} variant="outline">
          Escalate to Agent
        </Button>
      </div>
    </div>
  );
}