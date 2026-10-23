import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import Avatar, { GroupAvatar } from "../../components/Avatar";
import { formatTime } from "./chatData";

export default function ChatWindow({ conversation, me, peopleById, onSend, onBack }) {
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const isGroup = conversation.type === "group";

  // Keep the newest message in view
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation.messages.length]);

  const subtitle = isGroup
    ? [
        "You",
        ...conversation.members.map((id) => peopleById[id]?.name.split(" ")[0]),
      ]
        .filter(Boolean)
        .join(", ")
    : conversation.person.online
    ? "Online"
    : "Offline";

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(conversation.key, value);
    setText("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="md:hidden"
        >
          <ArrowLeft size={20} />
        </button>

        {isGroup ? (
          <GroupAvatar size={40} />
        ) : (
          <Avatar
            seed={conversation.person.avatar}
            size={40}
            online={conversation.person.online}
          />
        )}

        <div className="min-w-0">
          <p className="truncate text-sm">{conversation.title}</p>
          <p className="truncate text-xs text-neutral-500">
            {isGroup ? `${conversation.members.length + 1} members · ` : ""}
            {subtitle}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
        {conversation.messages.length === 0 && (
          <p className="py-10 text-center text-xs text-neutral-500">
            No messages yet. Say hi!
          </p>
        )}

        {conversation.messages.map((m) => {
          if (m.from === "system") {
            return (
              <p key={m.id} className="py-1 text-center text-xs text-neutral-400">
                {m.text}
              </p>
            );
          }

          const mine = m.from === "me";
          const sender = mine ? me : peopleById[m.from];

          return (
            <div
              key={m.id}
              className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine && isGroup && (
                <Avatar seed={sender?.avatar} size={28} />
              )}
              <div className={`max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                {!mine && isGroup && (
                  <span className="mb-1 px-1 text-xs text-neutral-500">
                    {sender?.name}
                  </span>
                )}
                <div
                  className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? "rounded-br-md bg-black text-white"
                      : "rounded-bl-md border border-neutral-200 bg-white"
                  }`}
                >
                  {m.text}
                </div>
                <span className="mt-1 px-1 text-[11px] text-neutral-400">
                  {formatTime(m.at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 border-t border-neutral-200 p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message"
          aria-label="Write a message"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-black"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white transition-opacity disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}