import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  fetchChatHistory,
  fetchChatSessionMessages,
  fetchChatSessions,
  sendChatMessage,
} from "../lib/apiClient.js";

const styles = `
.lawbot-shell {
  display: flex;
  height: 100vh;
  width: 100%;
  max-width: 100vw;
  overflow: hidden;
  background: linear-gradient(150deg, #f8fafc 0%, #eef2ff 100%);
  color: #0f172a;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.lawbot-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.96);
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 20px 18px;
}
.lawbot-sidebar h1 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 18px;
}
.lawbot-new-chat {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  border-radius: 9999px;
  font-size: 0.92rem;
  font-weight: 500;
  background: rgba(30, 64, 175, 0.28);
  color: #e0f2fe;
  border: 1px solid rgba(148, 163, 184, 0.35);
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: 18px;
}
.lawbot-new-chat:hover {
  background: rgba(30, 64, 175, 0.42);
}
.lawbot-session-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
  margin-right: -6px;
}
.lawbot-session-item {
  width: 100%;
  text-align: left;
  padding: 12px 15px;
  border-radius: 14px;
  background: transparent;
  border: 1px solid transparent;
  color: inherit;
  cursor: pointer;
  margin-bottom: 8px;
  transition: background 0.2s ease, border 0.2s ease;
}
.lawbot-session-item strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  color: #f8fafc;
}
.lawbot-session-item span {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: #cbd5f5;
}
.lawbot-session-item:hover {
  background: rgba(148, 163, 184, 0.18);
}
.lawbot-session-item.active {
  border-color: rgba(96, 165, 250, 0.55);
  background: rgba(30, 64, 175, 0.65);
}
.lawbot-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
}
.lawbot-chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 36px 48px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.lawbot-bubble {
  max-width: 680px;
  padding: 16px 20px;
  border-radius: 18px;
  font-size: 0.98rem;
  line-height: 1.6;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
  word-wrap: break-word;
  white-space: pre-wrap;
  position: relative;
}
.lawbot-bubble.user {
  align-self: flex-end;
  background: #1d4ed8;
  color: #f8fafc;
  border-bottom-right-radius: 6px;
}
.lawbot-bubble.bot {
  align-self: flex-start;
  background: rgba(248, 250, 252, 0.96);
  color: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-bottom-left-radius: 6px;
}
.lawbot-bubble.thinking {
  font-style: italic;
  color: #64748b;
  background: rgba(226, 232, 240, 0.8);
}
.lawbot-category {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: rgba(191, 219, 254, 0.7);
  color: #1d4ed8;
  padding: 4px 10px;
  border-radius: 9999px;
}
.lawbot-suggestions {
  margin-top: 8px;
  padding: 18px 22px;
  background: rgba(255, 255, 255, 0.86);
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lawbot-suggestions header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.lawbot-suggestions h2 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1d4ed8;
}
.lawbot-suggestion-grid {
  display: grid;
  gap: 12px;
}
.lawbot-suggestion-card {
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  padding: 14px 16px;
  background: rgba(30, 64, 175, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lawbot-suggestion-card strong {
  font-size: 1rem;
  color: #0f172a;
}
.lawbot-suggestion-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.78rem;
  color: #1e3a8a;
}
.lawbot-suggestion-actions {
  display: flex;
  justify-content: flex-start;
}
.lawbot-suggestion-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #1e3a8a;
  color: #f8fafc;
  text-decoration: none;
}
.lawbot-input-bar {
  padding: 24px 48px 30px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(248, 250, 252, 0.92);
}
.lawbot-input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: white;
  border-radius: 30px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 12px 16px;
}
.lawbot-textarea {
  flex: 1;
  min-height: 48px;
  max-height: 180px;
  resize: none;
  border: none;
  outline: none;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  color: #0f172a;
  background: transparent;
}
.lawbot-input-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lawbot-icon-button {
  min-width: 44px;
  min-height: 44px;
  border-radius: 9999px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
  transition: transform 0.15s ease, background 0.2s ease;
  padding: 0 18px;
  font-size: 0.9rem;
  font-weight: 600;
}
.lawbot-icon-button:hover {
  transform: translateY(-1px);
  background: rgba(37, 99, 235, 0.2);
}
.lawbot-icon-button.send {
  background: #1e40af;
  color: #f8fafc;
  font-size: 1.15rem;
}
.lawbot-icon-button.send:hover {
  background: #172554;
}
.lawbot-empty-state {
  align-self: center;
  max-width: 420px;
  text-align: center;
  padding: 32px 28px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 22px;
  border: 1px dashed rgba(148, 163, 184, 0.45);
  color: #475569;
  font-size: 0.95rem;
}
@media (max-width: 1080px) {
  .lawbot-sidebar {
    display: none;
  }
  .lawbot-chat-area {
    padding: 24px 20px;
  }
  .lawbot-input-bar {
    padding: 18px 20px 26px;
  }
}
`;

const normaliseMessages = (payload) => {
  if (!payload) return [];
  let items = [];
  if (Array.isArray(payload)) {
    items = payload;
  } else if (Array.isArray(payload?.messages)) {
    items = payload.messages;
  }

  return items.map((item, index) => {
    const rawRole = item.role || item.sender || (typeof item.is_user === "boolean" ? (item.is_user ? "user" : "assistant") : null);
    const role = ["assistant", "bot", "system"].includes(rawRole) ? "assistant" : "user";

    return {
      id: item.id ?? index,
      role,
      content: item.message || item.content || "",
      detectedCategory: item.detected_category || item.detectedCategory || null,
    };
  });
};

const formatAssistantContent = (message) => {
  const text = message.content || "";
  if (message.role !== "assistant") {
    return text;
  }

  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^>+\s?/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
};

const ChatPage = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [suggestedLawyers, setSuggestedLawyers] = useState([]);

  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const activeThinkingIdRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userId) {
        setSessions([]);
        setSessionId(null);
        setMessages([]);
        return;
      }
      try {
        const response = await fetchChatSessions(userId);
        const list = Array.isArray(response) ? response : response?.items || [];
        if (!mounted) return;
        setSessions(list);
        if (!sessionId && list.length) {
          handleSessionSelect(list[0].id, { auto: true });
        } else if (!list.length) {
          const history = await fetchChatHistory(userId);
          if (mounted) {
            setMessages(normaliseMessages(history));
          }
        }
      } catch (error) {
        console.error("Failed to load chat sessions", error);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
  }, []);

  const resetTypingInterval = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  };

  const addThinkingBubble = () => {
    const thinkingId = `thinking-${Date.now()}`;
    activeThinkingIdRef.current = thinkingId;
    setMessages((prev) => [
      ...prev,
      {
        id: thinkingId,
        role: "assistant",
        content: "LawBot is thinking…",
        isThinking: true,
      },
    ]);
  };

  const removeThinkingBubble = () => {
    const thinkingId = activeThinkingIdRef.current;
    if (!thinkingId) return;
    setMessages((prev) => prev.filter((msg) => msg.id !== thinkingId));
    activeThinkingIdRef.current = null;
  };

  const streamAssistantMessage = (fullText, detectedCategory) => {
    resetTypingInterval();

    const tokens = fullText.split(/(\s+)/);
    const messageId = `assistant-${Date.now()}`;
    let buffer = "";
    let index = 0;

    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        role: "assistant",
        content: "",
        detectedCategory: detectedCategory || null,
      },
    ]);

    if (!tokens.length) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content: fullText } : msg))
      );
      return;
    }

    typingIntervalRef.current = window.setInterval(() => {
      buffer += tokens[index] ?? "";
      index += 1;
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, content: buffer } : msg))
      );
      if (index >= tokens.length) {
        resetTypingInterval();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, content: fullText } : msg))
        );
      }
    }, 24);
  };

  const handleNewChat = () => {
    resetTypingInterval();
    activeThinkingIdRef.current = null;
    setSessionId(null);
    setMessages([]);
    setSuggestedLawyers([]);
  };

  const handleSessionSelect = async (targetSessionId, options = {}) => {
    if (!targetSessionId || !userId) return;
    resetTypingInterval();
    activeThinkingIdRef.current = null;
    try {
      const response = await fetchChatSessionMessages(targetSessionId);
      setMessages(normaliseMessages(response));
      setSessionId(targetSessionId);
      setSuggestedLawyers([]);
      if (!options.auto) {
        window.setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } catch (error) {
      console.error("Failed to load session", error);
    }
  };

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);
    addThinkingBubble();

    try {
      const response = await sendChatMessage({
        user_id: userId ?? undefined,
        session_id: userId ? sessionId ?? undefined : undefined,
        session_title: userId ? null : undefined,
        message: trimmed,
      });

      removeThinkingBubble();
      setSessionId(response.session_id ?? sessionId);
      streamAssistantMessage(response.answer || "", response.detected_category);
      setSuggestedLawyers(response.suggested_lawyers || []);

      if (userId) {
        const refreshed = await fetchChatSessions(userId);
        const list = Array.isArray(refreshed) ? refreshed : refreshed?.items || [];
        setSessions(list);
      }
    } catch (error) {
      console.error("Failed to send message", error);
      removeThinkingBubble();
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn’t respond right now. Please try again shortly.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleTextareaKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="lawbot-shell">
      <style>{styles}</style>
      <aside className="lawbot-sidebar">
        <h1>LawBot Conversations</h1>
        <button type="button" className="lawbot-new-chat" onClick={handleNewChat}>
          Start New Chat
        </button>
        <div className="lawbot-session-list">
          {sessions?.length ? (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                className={`lawbot-session-item ${sessionId === session.id ? "active" : ""}`}
                onClick={() => handleSessionSelect(session.id)}
              >
                <strong>{session.title || "Untitled conversation"}</strong>
                {session.last_activity_at ? (
                  <span>
                    {new Date(session.last_activity_at).toLocaleString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                ) : null}
              </button>
            ))
          ) : (
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", paddingRight: "4px" }}>
              Your conversations will appear here once you start chatting with LawBot.
            </p>
          )}
        </div>
      </aside>

      <main className="lawbot-main">
        <section className="lawbot-chat-area">
          {messages.length === 0 ? (
            <div className="lawbot-empty-state">
              Welcome to LawBot. Ask a question about your situation and I’ll guide you with clear, friendly next steps.
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`lawbot-bubble ${
                message.isThinking ? "thinking" : message.role === "user" ? "user" : "bot"
              }`}
            >
              {formatAssistantContent(message)}
              {message.detectedCategory && message.role === "assistant" ? (
                <span className="lawbot-category">{message.detectedCategory}</span>
              ) : null}
            </div>
          ))}

          {suggestedLawyers.length ? (
            <div className="lawbot-suggestions" role="complementary">
              <header>
                <h2>Suggested lawyers for you</h2>
                <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                  Tailored using your latest question
                </span>
              </header>
              <div className="lawbot-suggestion-grid">
                {suggestedLawyers.map((lawyer) => {
                  const params = new URLSearchParams();
                  if (lawyer.specialization) {
                    params.set("specialization", lawyer.specialization);
                  }
                  if (lawyer.city) {
                    params.set("city", lawyer.city);
                  }
                  const targetHref = params.toString() ? `/lawyers?${params.toString()}` : "/lawyers";
                  return (
                    <article key={lawyer.lawyer_id || lawyer.id} className="lawbot-suggestion-card">
                      <strong>{lawyer.full_name}</strong>
                      <div className="lawbot-suggestion-meta">
                        {lawyer.specialization ? <span>{lawyer.specialization}</span> : null}
                        {lawyer.city ? <span>{lawyer.city}</span> : null}
                        {typeof lawyer.experience_years === "number" ? (
                          <span>{lawyer.experience_years}+ yrs experience</span>
                        ) : null}
                        {typeof lawyer.average_rating === "number" ? (
                          <span>
                            {`Rating ${Number(lawyer.average_rating).toFixed(1)} (${lawyer.total_reviews ?? 0} reviews)`}
                          </span>
                        ) : null}
                      </div>
                      <div className="lawbot-suggestion-actions">
                        <Link className="lawbot-suggestion-link" to={targetHref}>
                          View profile
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div ref={messagesEndRef} />
        </section>

        <div className="lawbot-input-bar">
          <div className="lawbot-input-wrapper">
            <textarea
              className="lawbot-textarea"
              placeholder="Send a message..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              rows={1}
            />
            <div className="lawbot-input-actions">
              <button
                type="button"
                className="lawbot-icon-button"
                title="Voice input coming soon"
              >
                Voice
              </button>
              <button
                type="button"
                className="lawbot-icon-button send"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isSending}
                title="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
