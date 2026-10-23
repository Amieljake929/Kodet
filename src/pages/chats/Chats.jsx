import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Search,
  UserPlus,
  Users,
  Check,
  X,
  Clock,
} from "lucide-react";
import Avatar, { GroupAvatar } from "../../components/Avatar";
import ChatWindow from "./ChatWindow";
import NewGroupModal from "./NewGroupModal";
import {
  initialPeople,
  initialDMs,
  initialGroups,
  initialUnread,
  formatTime,
} from "./chatData";

const tabs = [
  { id: "chats", label: "Chats" },
  { id: "requests", label: "Requests" },
  { id: "discover", label: "Discover" },
];

const uid = () => Math.random().toString(36).slice(2, 10);

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200">
        <Icon size={22} />
      </span>
      <h3 className="mt-5 text-sm">{title}</h3>
      <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-neutral-500">
        {text}
      </p>
      {action}
    </div>
  );
}

function ConversationItem({ conv, active, unread, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
        active ? "bg-neutral-100" : "hover:bg-neutral-50"
      }`}
    >
      {conv.type === "group" ? (
        <GroupAvatar size={44} />
      ) : (
        <Avatar seed={conv.person.avatar} size={44} online={conv.person.online} />
      )}

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm">{conv.title}</span>
          {conv.last && (
            <span className="shrink-0 text-[11px] text-neutral-400">
              {formatTime(conv.last.at)}
            </span>
          )}
        </span>
        <span className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={`truncate text-xs ${
              unread ? "text-black" : "text-neutral-500"
            }`}
          >
            {conv.preview}
          </span>
          {unread > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-black px-1.5 text-[11px] text-white">
              {unread}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

function PersonRow({ person, subtitle, children }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3">
      <Avatar seed={person.avatar} size={44} online={person.online} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{person.name}</p>
        <p className="truncate text-xs text-neutral-500">
          {subtitle ?? person.role}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

const btnPrimary =
  "rounded-lg bg-black px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-80";
const btnOutline =
  "rounded-lg border border-neutral-300 px-3 py-1.5 text-xs transition-colors hover:bg-neutral-100";

export default function Chats() {
  const { user } = useOutletContext();

  const [people, setPeople] = useState(initialPeople);
  const [dms, setDms] = useState(initialDMs);
  const [groups, setGroups] = useState(initialGroups);
  const [unread, setUnread] = useState(initialUnread);
  const [tab, setTab] = useState("chats");
  const [query, setQuery] = useState("");
  const [activeKey, setActiveKey] = useState(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const me = {
    name: user.name,
    avatar: user.avatar || user.name || user.email,
  };

  const peopleById = useMemo(
    () => Object.fromEntries(people.map((p) => [p.id, p])),
    [people]
  );
  const connected = useMemo(
    () => people.filter((p) => p.status === "connected"),
    [people]
  );
  const incoming = people.filter((p) => p.status === "incoming");
  const sent = people.filter((p) => p.status === "pending");

  // Conversations = one per connection + every group
  const conversations = useMemo(() => {
    const firstName = (id) =>
      id === "me" ? "You" : peopleById[id]?.name.split(" ")[0] ?? "";

    const items = [
      ...connected.map((p) => ({
        key: `dm:${p.id}`,
        type: "dm",
        title: p.name,
        person: p,
        messages: dms[p.id] || [],
      })),
      ...groups.map((g) => ({
        key: `group:${g.id}`,
        type: "group",
        title: g.name,
        members: g.members,
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

  /* ---------------- actions (UI only, no backend) ---------------- */

  const setStatus = (id, status) =>
    setPeople((ps) => ps.map((p) => (p.id === id ? { ...p, status } : p)));

  const sendRequest = (id) => setStatus(id, "pending");
  const cancelRequest = (id) => setStatus(id, "none");
  const declineRequest = (id) => setStatus(id, "none");

  const acceptRequest = (id) => {
    setStatus(id, "connected");
    setDms((d) => ({
      ...d,
      [id]: [
        {
          id: uid(),
          from: "system",
          text: `You're now connected with ${peopleById[id].name}`,
          at: Date.now(),
        },
      ],
    }));
  };

  const openChat = (key) => {
    setActiveKey(key);
    setTab("chats");
    setQuery("");
    setUnread((u) => ({ ...u, [key]: 0 }));
  };

  const sendMessage = (key, text) => {
    const msg = { id: uid(), from: "me", text, at: Date.now() };
    const [type, id] = key.split(":");
    if (type === "dm") {
      setDms((d) => ({ ...d, [id]: [...(d[id] || []), msg] }));
    } else {
      setGroups((gs) =>
        gs.map((g) => (g.id === id ? { ...g, messages: [...g.messages, msg] } : g))
      );
    }
  };

  const createGroup = ({ name, memberIds }) => {
    const id = uid();
    setGroups((gs) => [
      {
        id,
        name,
        members: memberIds,
        messages: [
          { id: uid(), from: "system", text: "You created this group", at: Date.now() },
        ],
      },
      ...gs,
    ]);
    setGroupModalOpen(false);
    openChat(`group:${id}`);
  };

  /* ---------------- list content per tab ---------------- */

  const visibleConversations = conversations.filter((c) => !q || matches(c.title));
  const visiblePeople = (list) =>
    list.filter((p) => !q || matches(`${p.name} ${p.username}`));

  const renderChats = () =>
    visibleConversations.length === 0 ? (
      <EmptyState
        icon={MessageSquare}
        title={q ? "No chats found" : "No conversations yet"}
        text={
          q
            ? "Try a different name."
            : "Connect with someone to start chatting."
        }
        action={
          !q && (
            <button onClick={() => setTab("discover")} className={`${btnOutline} mt-5`}>
              Find people
            </button>
          )
        }
      />
    ) : (
      <div className="space-y-1">
        {visibleConversations.map((c) => (
          <ConversationItem
            key={c.key}
            conv={c}
            active={c.key === activeKey}
            unread={unread[c.key] || 0}
            onClick={() => openChat(c.key)}
          />
        ))}
      </div>
    );

  const renderRequests = () => {
    const inc = visiblePeople(incoming);
    const out = visiblePeople(sent);

    if (inc.length === 0 && out.length === 0) {
      return (
        <EmptyState
          icon={UserPlus}
          title="No requests"
          text="Connection requests you send or receive will show up here."
        />
      );
    }

    return (
      <div>
        {inc.length > 0 && (
          <>
            <p className="px-3 pb-1 pt-2 text-xs text-neutral-400">
              Received ({inc.length})
            </p>
            {inc.map((p) => (
              <div key={p.id} className="rounded-xl hover:bg-neutral-50">
                <PersonRow person={p} subtitle={p.role}>
                  <button
                    onClick={() => acceptRequest(p.id)}
                    aria-label={`Accept ${p.name}`}
                    className={btnPrimary}
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => declineRequest(p.id)}
                    aria-label={`Decline ${p.name}`}
                    className={btnOutline}
                  >
                    <X size={14} />
                  </button>
                </PersonRow>
                {p.note && (
                  <p className="px-3 pb-3 pl-[68px] text-xs leading-relaxed text-neutral-600">
                    “{p.note}”
                  </p>
                )}
              </div>
            ))}
          </>
        )}

        {out.length > 0 && (
          <>
            <p className="px-3 pb-1 pt-4 text-xs text-neutral-400">
              Sent ({out.length})
            </p>
            {out.map((p) => (
              <PersonRow key={p.id} person={p}>
                <span className="flex items-center gap-1 text-xs text-neutral-500">
                  <Clock size={12} />
                  Pending
                </span>
                <button onClick={() => cancelRequest(p.id)} className={btnOutline}>
                  Cancel
                </button>
              </PersonRow>
            ))}
          </>
        )}
      </div>
    );
  };

  const renderDiscover = () => {
    const list = visiblePeople(people);
    if (list.length === 0) {
      return (
        <EmptyState icon={Search} title="No people found" text="Try a different name or username." />
      );
    }

    return (
      <div className="space-y-1">
        {list.map((p) => (
          <PersonRow key={p.id} person={p} subtitle={`@${p.username} · ${p.role}`}>
            {p.status === "none" && (
              <button onClick={() => sendRequest(p.id)} className={btnPrimary}>
                <span className="flex items-center gap-1.5">
                  <UserPlus size={13} />
                  Connect
                </span>
              </button>
            )}
            {p.status === "pending" && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <Clock size={12} />
                Requested
              </span>
            )}
            {p.status === "incoming" && (
              <button onClick={() => acceptRequest(p.id)} className={btnPrimary}>
                Accept
              </button>
            )}
            {p.status === "connected" && (
              <button onClick={() => openChat(`dm:${p.id}`)} className={btnOutline}>
                Message
              </button>
            )}
          </PersonRow>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="text-3xl font-medium tracking-tight">Chats</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Talk and share ideas with people you're connected with.
      </p>

      <div className="mt-8 flex h-[calc(100vh-20rem)] min-h-[540px] overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {/* Left panel */}
        <div
          className={`min-h-0 w-full flex-col md:flex md:w-[320px] md:shrink-0 md:border-r md:border-neutral-200 ${
            activeConversation ? "hidden" : "flex"
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 pt-4">
            <h2 className="text-sm">Messages</h2>
            <button
              onClick={() => setGroupModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs transition-colors hover:bg-neutral-100"
            >
              <Users size={14} />
              New group
            </button>
          </div>

          {/* Tabs */}
          <div className="mx-4 mt-4 flex gap-1 rounded-xl bg-neutral-100 p-1">
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setQuery("");
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs transition-colors ${
                    active ? "bg-white shadow-sm" : "text-neutral-500 hover:text-black"
                  }`}
                >
                  {t.label}
                  {t.id === "requests" && incoming.length > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                      {incoming.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <label className="mx-4 mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus-within:border-black">
            <Search size={15} className="shrink-0 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "chats" ? "Search chats" : "Search people"
              }
              className="w-full bg-transparent text-xs outline-none placeholder:text-neutral-400"
            />
          </label>

          <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {tab === "chats" && renderChats()}
            {tab === "requests" && renderRequests()}
            {tab === "discover" && renderDiscover()}
          </div>
        </div>

        {/* Right panel */}
        <div
          className={`min-h-0 min-w-0 flex-1 md:flex ${
            activeConversation ? "flex flex-col" : "hidden"
          }`}
        >
          {activeConversation ? (
            <div className="h-full w-full">
              <ChatWindow
                key={activeConversation.key}
                conversation={activeConversation}
                me={me}
                peopleById={peopleById}
                onSend={sendMessage}
                onBack={() => setActiveKey(null)}
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
        </div>
      </div>

      <NewGroupModal
        open={groupModalOpen}
        connections={connected}
        onClose={() => setGroupModalOpen(false)}
        onCreate={createGroup}
      />
    </motion.div>
  );
}