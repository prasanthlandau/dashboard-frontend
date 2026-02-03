"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Trash2,
  RefreshCw,
  Loader2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "./chat.css";

interface SqlQueryResponse {
  success: boolean;
  query: string;
  generatedSql: string;
  data: any[];
  rowCount: number;
  naturalLanguageResponse: string;
  downloadFormat?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  sqlResponse?: SqlQueryResponse;
  timestamp?: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you today?",
      id: "1",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => `user-${Date.now()}`);
  const [downloadFormat, setDownloadFormat] = useState<string | null>(null);
  const [lastQueryResults, setLastQueryResults] =
    useState<SqlQueryResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: input,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Make API request to SQL query endpoint
      const response = await fetch(
        "https://aiapi.aspirelearning.app/api/sql/query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: userMessage.content,
            sessionId: sessionId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data: SqlQueryResponse = await response.json();

      // Store the query results and download format if available
      setLastQueryResults(data);
      setDownloadFormat(data.downloadFormat || null);

      // Create AI message with the natural language response
      const aiMessage: Message = {
        role: "assistant",
        content:
          data.naturalLanguageResponse ||
          "Sorry, I could not process your query.",
        id: Date.now().toString(),
        sqlResponse: data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching SQL query response:", error);

      // Show error message
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, there was an error processing your request. Please try again.",
        id: Date.now().toString(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    // Generate new sessionId when clearing chat
    setSessionId(`user-${Date.now()}`);
    setDownloadFormat(null);
    setLastQueryResults(null);
    setMessages([
      {
        role: "assistant",
        content: "Hello! How can I help you today?",
        id: "1",
        timestamp: new Date(),
      },
    ]);
  };

  const handleDownload = async () => {
    if (!downloadFormat || !sessionId) return;

    try {
      const response = await fetch("http://localhost:5555/api/sql/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionId,
          format: downloadFormat,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to download results");
      }

      // Get the filename from the Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `query-results-${Date.now()}.${downloadFormat}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create a blob from the response and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading results:", error);
      alert("Failed to download results. Please try again.");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={clearChat}
          title="Clear chat"
          className="clear-button"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message-row ${message.role}`}>
            <div className={`message-bubble ${message.role}`}>
              <div className="message-icon">
                {message.role === "user" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Bot className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                {/* Render text or HTML if present */}
                {/<[a-z][\s\S]*>/i.test(message.content) ? (
                  <div
                    className="message-content html-content"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                ) : (
                  <div className="message-content whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}
                {message.timestamp && (
                  <div className="text-xs opacity-50 mt-2 text-right">
                    {formatTime(message.timestamp)}
                  </div>
                )}
              </div>
              {message.role === "assistant" &&
                message.sqlResponse?.downloadFormat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 self-start"
                    onClick={handleDownload}
                    title={`Download as ${message.sqlResponse.downloadFormat}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-row assistant">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <form onSubmit={handleSubmit} className="input-form">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="input-field"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
