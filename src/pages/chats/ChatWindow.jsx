import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  Clock,
  MoreVertical,
  CornerDownLeft,
  Pin,
  SmilePlus,
} from "lucide-react";
import Avatar from "../../components/Avatar";
import GroupBadge from "./GroupBadge";
import ReactionsModal from "./ReactionsModal";
import { getTheme, REACTIONS } from "./chatOptions";
import { useChatData } from "./chatStore";
import { formatDateTime, formatTime } from "./chatData";

// Slim pill scrollbar (Chrome, Edge, Safari). Firefox keeps its default one.
const scrollbar =
  "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 " +
  "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#fbf2ef]/5 " +
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#fbf2ef]/25 " +
  "hover:[&::-webkit-scrollbar-thumb]:bg-[#fbf2ef]/40";

// Brand button colors: cream #fbf2ef on charcoal #1a1a1a
const accentBtn = "bg-[#fbf2ef] text-[#1a1a1a] transition-opacity hover:opacity-80 disabled:opacity-40";

// Quick schedule options for the composer
function getPresets() {
  const now = new Date();

  const tonight = new Date();
  tonight.setHours(20, 0, 0, 0);
  const rolled = tonight.getTime() <= Date.now();
  if (rolled) tonight.setDate(tonight.getDate() + 1);

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  return [
    { label: "In 1 hour", at: Date.now() + 3600000 },
    { label: rolled ? "Tomorrow, 8:00 PM" : "Tonight, 8:00 PM", at: tonight.getTime() },
    { label: "Tomorrow, 9:00 AM", at: tomorrow.getTime() },
  ];
}

export default function ChatWindow({ conversation, me, infoOpen, onToggleInfo, onBack }) {
  const {
    peopleById,
    meta: allMeta,
    pinned,
    reactions,
    sendMessage,
    scheduleMessage,
    toggleReaction,
  } = useChatData();

  const [text, setText] = useState("");
  const [pickerFor, setPickerFor] = useState(null); // message id with the reaction picker open
  const [reactionView, setReactionView] = useState(null); // { msgId, tab }
  const [schedOpen, setSchedOpen] = useState(false);
  const [customAt, setCustomAt] = useState("");
  const [note, setNote] = useState("");

  const listRef = useRef(null);
  const schedRef = useRef(null);
  const noteTimer = useRef(null);

  const isGroup = conversation.type === "group";
  const meta = allMeta[conversation.key] || {};
  // The theme only colors the bubbles you send. The background never changes.
  const theme = getTheme(meta.theme);
  const isPinned = pinned.includes(conversation.key);

  // Keep the newest message in view
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation.messages.length]);

  // Close the reaction picker / schedule menu when clicking elsewhere
  useEffect(() => {
    const onDown = (e) => {
      if (!e.target.closest?.("[data-picker]")) setPickerFor(null);
      if (schedRef.current && !schedRef.current.contains(e.target)) setSchedOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => () => clearTimeout(noteTimer.current), []);

  const online = !isGroup && conversation.person.online;
  const subtitle = isGroup
    ? [
        "You",
        ...conversation.members.map((id) => peopleById[id]?.name.split(" ")[0]),
      ]
        .filter(Boolean)
        .join(", ")
    : online
    ? "Online"
    : "Offline";

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    sendMessage(conversation.key, value);
    setText("");
  };

  const handleSchedule = (at) => {
    const value = text.trim();
    if (!value) return;
    scheduleMessage(conversation.key, value, at);
    setText("");
    setSchedOpen(false);
    setCustomAt("");
    setNote(`Scheduled for ${formatDateTime(at)}. Find it under Scheduled.`);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(""), 4000);
  };

  const customTime = customAt ? new Date(customAt).getTime() : 0;
  const customValid = customTime > Date.now();

  const viewData = reactionView
    ? reactions[`${conversation.key}|${reactionView.msgId}`] || {}
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header: same height as the other columns so the divider lines up */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-neutral-200 px-5">
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="md:hidden"
        >
          <ArrowLeft size={18} />
        </button>

        {isGroup ? (
          <GroupBadge iconId={meta.icon} themeId={meta.theme} size={36} />
        ) : (
          <Avatar
            seed={conversation.person.avatar}
            size={36}
            online={conversation.person.online}
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[13px]">
            <span className="truncate">{conversation.title}</span>
            {isPinned && <Pin size={11} className="shrink-0 text-neutral-400" />}
          </p>
          <p className="truncate text-[11px] text-neutral-500">
            {isGroup ? (
              `${conversation.members.length + 1} members · ${subtitle}`
            ) : (
              <span className={online ? "text-emerald-600" : ""}>{subtitle}</span>
            )}
          </p>
        </div>

        <button
          onClick={onToggleInfo}
          aria-label={isGroup ? "Toggle group info" : "Toggle chat info"}
          aria-pressed={infoOpen}
          className={`rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black ${
            infoOpen ? "bg-neutral-100 text-black" : ""
          }`}
        >
          <MoreVertical size={17} />
        </button>
      </div>

      {/* Messages (background stays neutral; only your bubbles use the theme) */}
      <div
        ref={listRef}
        className={`flex-1 space-y-3 overflow-y-auto px-5 py-6 ${scrollbar}`}
      >
        {conversation.messages.length === 0 && (
          <p className="py-10 text-center text-[11px] text-neutral-500">
            No messages yet. Say hi!
          </p>
        )}

        {conversation.messages.map((m) => {
          if (m.from === "system") {
            return (
              <p key={m.id} className="py-1 text-center text-[11px] text-neutral-400">
                {m.text}
              </p>
            );
          }

          const mine = m.from === "me";
          const sender = mine ? me : peopleById[m.from];
          const r = reactions[`${conversation.key}|${m.id}`] || {};
          const chips = REACTIONS.filter((x) => (r[x.id] || []).length > 0);

          return (
            <div
              key={m.id}
              className={`group flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine && isGroup && <Avatar seed={sender?.avatar} size={26} />}

              <div
                className={`flex max-w-[78%] flex-col ${mine ? "items-end" : "items-start"}`}
              >
                {!mine && isGroup && (
                  <span className="mb-1 px-1 text-[11px] text-neutral-500">
                    {sender?.name}
                  </span>
                )}

                <div className={`flex items-center gap-1.5 ${mine ? "flex-row-reverse" : ""}`}>
                  {/* Bubble wrapper: reactions hang off its bottom edge */}
                  <div className={`relative min-w-0 ${chips.length > 0 ? "mb-3.5" : ""}`}>
                    <div
                      style={
                        mine
                          ? { backgroundColor: theme.bubble, color: theme.text }
                          : undefined
                      }
                      className={`rounded-2xl px-3.5 pb-1.5 pt-2 ${
                        mine
                          ? "rounded-br-md"
                          : "rounded-bl-md border border-neutral-200 bg-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                        {m.text}
                      </p>
                      {/* Time (and ticks) live inside the bubble, bottom right */}
                      <span
                        style={mine ? { color: theme.sub } : undefined}
                        className={`mt-0.5 flex items-center justify-end gap-1 text-[10px] ${
                          mine ? "" : "text-neutral-400"
                        }`}
                      >
                        {formatTime(m.at)}
                        {mine && <CheckCheck size={12} className="text-emerald-300" />}
                      </span>
                    </div>

                    {/* Reactions overlay the bubble's bottom edge */}
                    {chips.length > 0 && (
                      <div className="absolute -bottom-3 left-2 flex gap-1">
                        {chips.map((x) => {
                          const list = r[x.id] || [];
                          return (
                            <button
                              key={x.id}
                              onClick={() => setReactionView({ msgId: m.id, tab: x.id })}
                              aria-label={`${x.label}: ${list.length}. See who reacted`}
                              className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] shadow-sm transition-colors hover:bg-neutral-50 ${
                                list.includes("me")
                                  ? "border-neutral-400 bg-neutral-100"
                                  : "border-neutral-200 bg-white"
                              }`}
                            >
                              <span className="flex items-center">{x.emoji}</span>
                              <span className="text-neutral-600">{list.length}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Reaction picker */}
                  <span className="relative" data-picker>
                    <button
                      onClick={() => setPickerFor(pickerFor === m.id ? null : m.id)}
                      aria-label="Add reaction"
                      aria-expanded={pickerFor === m.id}
                      className="rounded-full p-1 text-neutral-400 opacity-0 transition-opacity hover:text-black focus-visible:opacity-100 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <SmilePlus size={15} />
                    </button>

                    {pickerFor === m.id && (
                      <div
                        role="menu"
                        className={`absolute bottom-full z-10 mb-1 flex gap-0.5 rounded-full border border-neutral-200 bg-white p-1 shadow-lg ${
                          mine ? "right-0" : "left-0"
                        }`}
                      >
                        {REACTIONS.map((x) => {
                          const picked = (r[x.id] || []).includes("me");
                          return (
                            <button
                              key={x.id}
                              role="menuitem"
                              onClick={() => {
                                toggleReaction(conversation.key, m.id, x.id);
                                setPickerFor(null);
                              }}
                              aria-label={x.label}
                              title={x.label}
                              className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 hover:bg-neutral-50 ${
                                picked ? "bg-neutral-100" : ""
                              }`}
                            >
                              {x.emoji}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Composer (no background so it sits on the page like everything else) */}
      <div className="shrink-0 border-t border-neutral-200 p-4">
        {note && (
          <p role="status" className="px-1 pb-2 text-[11px] text-neutral-500">
            {note}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message"
            aria-label="Write a message"
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-[13px] outline-none placeholder:text-neutral-400 focus:border-[#fbf2ef]/40"
          />

          {/* Schedule */}
          <div className="relative" ref={schedRef}>
            <button
              type="button"
              onClick={() => setSchedOpen((v) => !v)}
              disabled={!text.trim()}
              aria-label="Schedule message"
              aria-expanded={schedOpen}
              title={text.trim() ? "Schedule message" : "Write a message to schedule it"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-black disabled:opacity-40"
            >
              <Clock size={15} />
            </button>

            {schedOpen && (
              <div className="absolute bottom-full right-0 z-10 mb-2 w-64 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl">
                <p className="px-2.5 pb-1 pt-1.5 text-[11px] text-neutral-400">
                  Send later
                </p>
                {getPresets().map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSchedule(p.at)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left text-xs transition-colors hover:bg-neutral-100"
                  >
                    {p.label}
                    <span className="text-[10px] text-neutral-400">
                      {formatDateTime(p.at)}
                    </span>
                  </button>
                ))}
                <div className="mt-1 border-t border-neutral-200 p-2">
                  <input
                    type="datetime-local"
                    value={customAt}
                    onChange={(e) => setCustomAt(e.target.value)}
                    aria-label="Pick date and time"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#fbf2ef]/40"
                  />
                  <button
                    type="button"
                    disabled={!customValid}
                    onClick={() => handleSchedule(customTime)}
                    className={`${accentBtn} mt-2 w-full rounded-lg px-3 py-1.5 text-xs`}
                  >
                    Schedule
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Send button uses the brand colors; only the message bubbles follow the chat theme */}
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Send message"
            className={`${accentBtn} flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs`}
          >
            send
            <CornerDownLeft size={14} />
          </button>
        </form>
      </div>

      {/* Who reacted */}
      {reactionView && (
        <ReactionsModal
          data={viewData}
          initialTab={reactionView.tab}
          me={me}
          peopleById={peopleById}
          onClose={() => setReactionView(null)}
        />
      )}
    </div>
  );
}