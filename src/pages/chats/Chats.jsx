import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Clock,
  Info,
  MessageSquare,
  Pin,
  PinOff,
  Search,
  Star,
  User,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Avatar from "../../components/Avatar";
import ChatWindow from "./ChatWindow";
import ChatInfo from "./ChatInfo";
import ConnectionsPanel from "./ConnectionsPanel";
import NewGroupModal from "./NewGroupModal";
import { EmptyState, btnOutline } from "./chatUi";
import GroupBadge from "./GroupBadge";
import { MAX_PINS } from "./chatOptions";
import { useChatData } from "./chatStore";
import { formatDateTime, formatTime } from "./chatData";

/* ------------------------------ shared styles ------------------------------ */

// Desktop placement: fills the whole main area, below the top bar (70px)
// and to the right of the app sidebar (16rem). Same values as Notes.jsx.
const FULL_BLEED =
  "lg:fixed lg:bottom-0 lg:left-64 lg:right-0 lg:top-[70px] lg:h-auto lg:min-h-0";

// Brand button colors: cream #fbf2ef on charcoal #1a1a1a
const accentBtn =
  "rounded-xl bg-[#fbf2ef] text-[#1a1a1a] transition-opacity hover:opacity-80";
const badge =
  "flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#fbf2ef] px-1 text-[10px] text-[#1a1a1a]";

// Slim pill scrollbar (Chrome, Edge, Safari). Firefox keeps its default one.
const scrollbar =
  "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 " +
  "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#fbf2ef]/5 " +
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#fbf2ef]/25 " +
  "hover:[&::-webkit-scrollbar-thumb]:bg-[#fbf2ef]/40";

const categories = [
  { id: "all", label: "All chats", icon: MessageSquare },
  { id: "groups", label: "Group chat", icon: Users },
  { id: "direct", label: "Direct chat", icon: User },
  { id: "connections", label: "Connections", icon: UserCheck },
  { id: "scheduled", label: "Scheduled", icon: Clock },
  { id: "starred", label: "Starred", icon: Star },
  { id: "archived", label: "Archived", icon: Archive },
];

const emptyCopy = {
  all: ["No conversations yet", "Connect with someone to start chatting."],
  groups: ["No group chats", "Create one with New group."],
  direct: ["No direct chats", "Connect with someone to start chatting."],
  starred: ["No starred chats", "Star a chat from its info panel."],
  archived: ["Nothing archived", "Chats you archive will show up here."],
};

function ConversationItem({ conv, meta, active, unread, pinned, onClick, onPin }) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
          active ? "bg-neutral-100" : "hover:bg-neutral-50"
        }`}
      >
        {conv.type === "group" ? (
          <GroupBadge iconId={meta.icon} themeId={meta.theme} size={40} />
        ) : (
          <Avatar seed={conv.person.avatar} size={40} online={conv.person.online} />
        )}

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-[13px]">{conv.title}</span>
            <span className="flex shrink-0 items-center gap-1 text-[10px] text-neutral-400">
              {pinned && <Pin size={10} />}
              {conv.last && formatTime(conv.last.at)}
            </span>
          </span>
          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span
              className={`truncate text-[11px] ${
                unread ? "text-black" : "text-neutral-500"
              }`}
            >
              {conv.preview}
            </span>
            {unread > 0 && <span className={badge}>{unread}</span>}
          </span>
        </span>
      </button>

      {/* Quick pin: shows on hover (pointer devices) or keyboard focus */}
      <button
        onClick={onPin}
        aria-label={pinned ? `Unpin ${conv.title}` : `Pin ${conv.title}`}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-lg border border-neutral-200 bg-white p-1.5 opacity-0 shadow-sm transition-opacity focus-visible:pointer-events-auto focus-visible:opacity-100 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:opacity-100"
      >
        {pinned ? <PinOff size={12} /> : <Pin size={12} />}
      </button>
    </div>
  );
}

export default function Chats() {
  const { user } = useOutletContext();
  const location = useLocation();
  const {
    peopleById,
    connected,
    incoming,
    dms,
    groups,
    unread,
    meta,
    pinned,
    starred,
    archived,
    scheduled,
    createGroup,
    markRead,
    togglePin,
    cancelScheduled,
    sendScheduledNow,
  } = useChatData();

  // The People page can deep-link here: navigate("/dashboard/chats", { state: { open: "dm:aria" } })
  const initialKey = location.state?.open ?? null;

  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [activeKey, setActiveKey] = useState(initialKey);
  const [infoOpen, setInfoOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);

  useEffect(() => {
    if (initialKey) markRead(initialKey);
    return () => clearTimeout(noticeTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const me = {
    name: user.name,
    avatar: user.avatar || user.name || user.email,
  };

  // Conversations = one per connection + every group
  const conversations = useMemo(() => {
    const firstName = (id) =>
      id === "me" ? "You" : peopleById[id]?.name.split(" ")[0] ?? "";

    const items = [
      ...connected.map((p) => ({
        key: `dm:${p.id}`,
        id: p.id,
        type: "dm",
        title: p.name,
        person: p,
        messages: dms[p.id] || [],
      })),
      ...groups.map((g) => ({
        key: `group:${g.id}`,
        id: g.id,
        type: "group",
        title: g.name,
        members: g.members,
        createdAt: g.createdAt ?? g.messages[0]?.at ?? Date.now(),
        messages: g.messages,
      })),
    ];

    return items
      .map((c) => {
        const last = c.messages[c.messages.length - 1];
        let preview = "No messages yet";
        if (last) {
          preview =
            last.from === "system"
              ? last.text
              : c.type === "group" || last.from === "me"
              ? `${firstName(last.from)}: ${last.text}`
              : last.text;
        }
        return { ...c, last, preview };
      })
      .sort((a, b) => (b.last?.at || 0) - (a.last?.at || 0));
  }, [connected, groups, dms, peopleById]);

  const activeConversation = conversations.find((c) => c.key === activeKey);
  const q = query.trim().toLowerCase();
  const matches = (text) => text.toLowerCase().includes(q);

  /* ---------------- per-category lists ---------------- */

  const isArchived = (c) => archived.includes(c.key);
  const inCategory = (c) => {
    switch (category) {
      case "groups":
        return c.type === "group" && !isArchived(c);
      case "direct":
        return c.type === "dm" && !isArchived(c);
      case "starred":
        return starred.includes(c.key);
      case "archived":
        return isArchived(c);
      default:
        return !isArchived(c);
    }
  };

  const showPinned = ["all", "groups", "direct"].includes(category);
  const visible = conversations
    .filter(inCategory)
    .filter((c) => !q || matches(c.title));
  const pinnedList = showPinned
    ? pinned
        .map((key) => visible.find((c) => c.key === key))
        .filter(Boolean)
    : [];
  const restList = visible.filter((c) => !(showPinned && pinned.includes(c.key)));

  const visibleScheduled = scheduled.filter((s) => {
    if (!q) return true;
    const title = conversations.find((c) => c.key === s.key)?.title ?? "";
    return matches(`${title} ${s.text}`);
  });

  // Badge per category: unread count for chat lists, plain count for the rest
  const unreadIn = (fn) =>
    conversations.filter(fn).reduce((sum, c) => sum + (unread[c.key] || 0), 0);
  const badgeFor = (id) => {
    switch (id) {
      case "all":
        return { n: unreadIn((c) => !isArchived(c)), strong: true };
      case "groups":
        return { n: unreadIn((c) => c.type === "group" && !isArchived(c)), strong: true };
      case "direct":
        return { n: unreadIn((c) => c.type === "dm" && !isArchived(c)), strong: true };
      case "connections":
        return { n: connected.length };
      case "scheduled":
        return { n: scheduled.length };
      case "starred":
        return { n: starred.length };
      case "archived":
        return { n: archived.length };
      default:
        return { n: 0 };
    }
  };

  const activeCategory = categories.find((c) => c.id === category);

  /* ---------------- actions ---------------- */

  const selectCategory = (id) => {
    setCategory(id);
    setQuery("");
  };

  const openChat = (key) => {
    setActiveKey(key);
    if (category === "connections" || category === "scheduled") setCategory("all");
    setQuery("");
    markRead(key);
  };

  const handlePin = (key) => {
    const result = togglePin(key);
    if (result === "limit") {
      setNotice(`You can pin up to ${MAX_PINS} chats. Unpin one first.`);
      clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setNotice(""), 3000);
    }
  };

  const handleCreateGroup = (payload) => {
    const id = createGroup(payload);
    setGroupModalOpen(false);
    openChat(`group:${id}`);
  };

  const renderItem = (c) => (
    <ConversationItem
      key={c.key}
      conv={c}
      meta={meta[c.key] || {}}
      active={c.key === activeKey}
      unread={unread[c.key] || 0}
      pinned={pinned.includes(c.key)}
      onClick={() => openChat(c.key)}
      onPin={() => handlePin(c.key)}
    />
  );

  const renderList = () => {
    if (category === "connections") {
      return (
        <ConnectionsPanel
          connections={connected}
          activeKey={activeKey}
          query={query}
          onOpen={(id) => openChat(`dm:${id}`)}
        />
      );
    }

    if (category === "scheduled") {
      if (visibleScheduled.length === 0) {
        return (
          <EmptyState
            icon={Clock}
            title={q ? "No scheduled messages found" : "No scheduled messages"}
            text="Use the clock button next to send to schedule a message for later."
          />
        );
      }
      return (
        <div className="space-y-2 px-1">
          {visibleScheduled.map((s) => {
            const conv = conversations.find((c) => c.key === s.key);
            return (
              <div key={s.id} className="rounded-xl border border-neutral-200 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px]">{conv?.title ?? "Chat"}</span>
                  <span className="shrink-0 text-[10px] text-neutral-400">
                    {formatDateTime(s.at)}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] text-neutral-500">{s.text}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => sendScheduledNow(s.id)}
                    className={`${accentBtn} px-4 py-2 text-xs`}
                  >
                    Send now
                  </button>
                  <button onClick={() => cancelScheduled(s.id)} className={btnOutline}>
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (pinnedList.length + restList.length === 0) {
      const [title, text] = emptyCopy[category] ?? emptyCopy.all;
      return (
        <EmptyState
          icon={activeCategory.icon}
          title={q ? "No chats found" : title}
          text={q ? "Try a different name." : text}
          action={
            !q && (category === "all" || category === "direct") ? (
              <Link to="/dashboard/people" className={`${btnOutline} mt-5`}>
                Find people
              </Link>
            ) : null
          }
        />
      );
    }

    return (
      <div className="space-y-0.5">
        {pinnedList.length > 0 && (
          <>
            <p className="flex items-center gap-1.5 px-3 pb-1 pt-1 text-[11px] text-neutral-400">
              <Pin size={10} />
              Pinned ({pinned.length}/{MAX_PINS})
            </p>
            {pinnedList.map(renderItem)}
            {restList.length > 0 && (
              <p className="px-3 pb-1 pt-3 text-[11px] text-neutral-400">
                {activeCategory.label}
              </p>
            )}
          </>
        )}
        {restList.map(renderItem)}
      </div>
    );
  };

  const incomingBadge =
    incoming.length > 0 ? <span className={badge}>{incoming.length}</span> : null;

  return (
    <>
      {/* Frameless page: no outer box. On desktop it fills the whole main area. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex h-full min-h-0 flex-col ${FULL_BLEED}`}
      >
        <h1 className="sr-only">Chats</h1>

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {/* Left rail: categories (wide screens) */}
          <nav
            aria-label="Chat categories"
            className="hidden w-[220px] shrink-0 flex-col border-r border-neutral-200 xl:flex"
          >
            <div className="flex h-16 shrink-0 items-center border-b border-neutral-200 px-3">
              <button
                onClick={() => setGroupModalOpen(true)}
                className={`${accentBtn} flex w-full items-center justify-center gap-2 px-3 py-2.5 text-xs`}
              >
                <Users size={14} />
                New group
              </button>
            </div>

            <ul className={`min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3 ${scrollbar}`}>
              {categories.map(({ id, label, icon: Icon }) => {
                const { n, strong } = badgeFor(id);
                const active = category === id;
                return (
                  <li key={id}>
                    <button
                      onClick={() => selectCategory(id)}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                        active ? "bg-neutral-100" : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#fbf2ef]" />
                      )}
                      <Icon size={15} className="shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {n > 0 &&
                        (strong ? (
                          <span className={badge}>{n}</span>
                        ) : (
                          <span className="text-[11px] text-neutral-400">{n}</span>
                        ))}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="shrink-0 border-t border-neutral-200 p-3">
              <Link
                to="/dashboard/people"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-neutral-600 transition-colors hover:bg-neutral-50"
              >
                <UserPlus size={15} className="shrink-0" />
                <span className="flex-1">Requests &amp; discover</span>
                {incomingBadge}
              </Link>
            </div>
          </nav>

          {/* List column */}
          <div
            className={`min-h-0 w-full flex-col md:flex md:w-[320px] md:shrink-0 md:border-r md:border-neutral-200 ${
              activeConversation ? "hidden" : "flex"
            }`}
          >
            <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-neutral-200 px-4">
              <h2 className="text-[13px]">{activeCategory.label}</h2>

              {/* Shortcuts when the left rail is hidden */}
              <div className="flex items-center gap-2 xl:hidden">
                <Link
                  to="/dashboard/people"
                  aria-label="Requests and discover people"
                  title="Requests and discover"
                  className="relative rounded-lg border border-neutral-200 p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
                >
                  <UserPlus size={14} />
                  {incoming.length > 0 && (
                    <span className={`${badge} absolute -right-1.5 -top-1.5`}>
                      {incoming.length}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setGroupModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#fbf2ef] px-2.5 py-1.5 text-[11px] text-[#1a1a1a] transition-opacity hover:opacity-80"
                >
                  <Users size={13} />
                  New group
                </button>
              </div>
            </div>

            {/* Category chips when the left rail is hidden */}
            <div className={`flex shrink-0 gap-1.5 overflow-x-auto px-4 pt-3 pb-2 xl:hidden ${scrollbar}`}>
              {categories.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => selectCategory(id)}
                  className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                    category === id
                      ? "border-[#fbf2ef] bg-[#fbf2ef] text-[#1a1a1a]"
                      : "border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-black"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <label className="mx-3 mt-3 flex shrink-0 items-center gap-2.5 rounded-xl border border-neutral-200 px-3 py-2 focus-within:border-[#fbf2ef]/40">
              <Search size={14} className="shrink-0 text-neutral-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  category === "connections"
                    ? "Search connections"
                    : category === "scheduled"
                    ? "Search scheduled"
                    : "Search chats"
                }
                className="w-full bg-transparent text-xs outline-none placeholder:text-neutral-400"
              />
            </label>

            <AnimatePresence>
              {notice && (
                <motion.p
                  role="status"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-3 mt-3 flex shrink-0 items-center gap-2 overflow-hidden rounded-lg bg-neutral-100 px-3 py-2 text-[11px] text-neutral-600"
                >
                  <Info size={12} className="shrink-0" />
                  {notice}
                </motion.p>
              )}
            </AnimatePresence>

            <div className={`mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3 ${scrollbar}`}>
              {renderList()}
            </div>
          </div>

          {/* Chat window.
              `relative overflow-hidden` makes this the positioning context for the info
              overlay, so the blur and the panel cover only the conversation area. */}
          <div
            className={`relative min-h-0 min-w-0 flex-1 overflow-hidden md:flex ${
              activeConversation ? "flex flex-col" : "hidden"
            }`}
          >
            {activeConversation ? (
              <div className="h-full w-full">
                <ChatWindow
                  key={activeConversation.key}
                  conversation={activeConversation}
                  me={me}
                  infoOpen={infoOpen}
                  onToggleInfo={() => setInfoOpen((v) => !v)}
                  onBack={() => {
                    setActiveKey(null);
                    setInfoOpen(false);
                  }}
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <EmptyState
                  icon={MessageSquare}
                  title="Select a conversation"
                  text="Pick a chat from the list, or connect with someone new to start talking."
                />
              </div>
            )}

            {/* Info panel: always an overlay on top of the chat (never pushes or resizes it).
                The chat behind it is blurred. Click the blur to close. */}
            <AnimatePresence>
              {infoOpen && activeConversation && (
                <motion.div
                  key="info-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setInfoOpen(false)}
                  className="absolute inset-0 z-10 bg-white/30 backdrop-blur-sm"
                />
              )}
              {infoOpen && activeConversation && (
                <motion.aside
                  key="info-panel"
                  aria-label={
                    activeConversation.type === "group" ? "Group info" : "Chat info"
                  }
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute inset-y-0 right-0 z-20 flex w-full flex-col border-l border-neutral-200 bg-white shadow-xl sm:w-[340px]"
                >
                  <ChatInfo
                    key={activeConversation.key}
                    conversation={activeConversation}
                    me={me}
                    meta={meta[activeConversation.key] || {}}
                    isPinned={pinned.includes(activeConversation.key)}
                    isStarred={starred.includes(activeConversation.key)}
                    isArchived={archived.includes(activeConversation.key)}
                    pinnedCount={pinned.length}
                    onClose={() => setInfoOpen(false)}
                  />
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Outside the full-screen panel so the modal layers above everything */}
      <NewGroupModal
        open={groupModalOpen}
        connections={connected}
        onClose={() => setGroupModalOpen(false)}
        onCreate={handleCreateGroup}
      />
    </>
  );
}