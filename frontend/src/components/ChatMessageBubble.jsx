const ChatMessageBubble = ({ message }) => {
  if (!message) return null;

  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm leading-relaxed shadow-soft sm:max-w-2xl ${
          isUser ? "bg-brand-600 text-white" : "bg-white text-slate-700"
        }`}
      >
        {message.content}
        {message.sources?.length ? (
          <details className={`mt-3 text-xs ${isUser ? "text-white/80" : "text-slate-500"}`}>
            <summary className="cursor-pointer font-semibold">Sources</summary>
            <ul className="mt-2 space-y-2">
              {message.sources.map((source, idx) => (
                <li key={`${source.pdf_path}-${source.chunk_id}-${idx}`}>
                  <p className="font-medium">{source.pdf_path}</p>
                  <p className="mt-1 opacity-80">{source.text}</p>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
        {!isUser && message.detected_category ? (
          <span
            className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              isUser ? "bg-white/20 text-white" : "bg-brand-50 text-brand-700"
            }`}
          >
            {message.detected_category}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
