import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  initialPeople,
  initialDMs,
  initialGroups,
  initialUnread,
  initialReactions,
} from "./chatData";
import { MAX_PINS } from "./chatOptions";

// UI-only store (no backend). Swap these actions for API calls later.

const ChatDataContext = createContext(null);

export function useChatData() {
  const ctx = useContext(ChatDataContext);
  if (!ctx) throw new Error("useChatData must be used inside <ChatDataProvider>");
  return ctx;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function ChatDataProvider({ children }) {
  const [people, setPeople] = useState(initialPeople);
  const [dms, setDms] = useState(initialDMs);
  const [groups, setGroups] = useState(initialGroups);
  const [unread, setUnread] = useState(initialUnread);
  const [meta, setMeta] = useState({}); // conversation key -> { theme, icon }
  const [pinned, setPinned] = useState(["group:g1"]); // max 5
  const [starred, setStarred] = useState([]);
  const [archived, setArchived] = useState([]);
  const [scheduled, setScheduled] = useState([]); // { id, key, text, at }
  const [reactions, setReactions] = useState(initialReactions);

  const peopleById = useMemo(
    () => Object.fromEntries(people.map((p) => [p.id, p])),
    [people]
  );
  const connected = useMemo(
    () => people.filter((p) => p.status === "connected"),
    [people]
  );
  const incoming = useMemo(
    () => people.filter((p) => p.status === "incoming"),
    [people]
  );
  const sent = useMemo(
    () => people.filter((p) => p.status === "pending"),
    [people]
  );

  /* ---------------- connections ---------------- */

  const setStatus = (id, status, extra = {}) =>
    setPeople((ps) =>
      ps.map((p) => (p.id === id ? { ...p, status, ...extra } : p))
    );

  const sendRequest = (id) => setStatus(id, "pending");
  const cancelRequest = (id) => setStatus(id, "none");
  const declineRequest = (id) => setStatus(id, "none");

  const acceptRequest = (id) => {
    const at = Date.now();
    setStatus(id, "connected", { connectedAt: at });
    setDms((d) => ({
      ...d,
      [id]: [
        {
          id: uid(),
          from: "system",
          text: `You're now connected with ${peopleById[id].name}`,
          at,
        },
      ],
    }));
  };

  /* ---------------- messages ---------------- */

  const markRead = (key) => setUnread((u) => ({ ...u, [key]: 0 }));

  const sendMessage = (key, text, at = Date.now()) => {
    const msg = { id: uid(), from: "me", text, at };
    const [type, id] = key.split(":");
    if (type === "dm") {
      setDms((d) => ({ ...d, [id]: [...(d[id] || []), msg] }));
    } else {
      setGroups((gs) =>
        gs.map((g) => (g.id === id ? { ...g, messages: [...g.messages, msg] } : g))
      );
    }
  };

  /* ---------------- scheduled messages ---------------- */

  const scheduleMessage = (key, text, at) =>
    setScheduled((list) =>
      [...list, { id: uid(), key, text, at }].sort((a, b) => a.at - b.at)
    );

  const cancelScheduled = (id) =>
    setScheduled((list) => list.filter((s) => s.id !== id));

  const sendScheduledNow = (id) => {
    const item = scheduled.find((s) => s.id === id);
    if (!item) return;
    sendMessage(item.key, item.text);
    cancelScheduled(id);
  };

  // Deliver scheduled messages once their time arrives (UI demo only)
  const scheduledRef = useRef(scheduled);
  scheduledRef.current = scheduled;
  useEffect(() => {
    const timer = setInterval(() => {
      const due = scheduledRef.current.filter((s) => s.at <= Date.now());
      if (due.length === 0) return;
      due.forEach((s) => sendMessage(s.key, s.text));
      const ids = new Set(due.map((s) => s.id));
      setScheduled((list) => list.filter((s) => !ids.has(s.id)));
    }, 15000);
    return () => clearInterval(timer);
    // sendMessage only uses state setters, so the first closure is safe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- reactions ---------------- */

  // One reaction per person per message. Tapping the same one again removes it.
  const toggleReaction = (key, msgId, type) => {
    const k = `${key}|${msgId}`;
    setReactions((all) => {
      const cur = all[k] || {};
      const had = (cur[type] || []).includes("me");
      const next = {};
      Object.keys(cur).forEach((t) => {
        next[t] = cur[t].filter((id) => id !== "me");
      });
      if (!had) next[type] = [...(next[type] || []), "me"];
      return { ...all, [k]: next };
    });
  };

  /* ---------------- groups ---------------- */

  const createGroup = ({ name, memberIds }) => {
    const id = uid();
    const at = Date.now();
    setGroups((gs) => [
      {
        id,
        name,
        members: memberIds,
        createdAt: at,
        messages: [{ id: uid(), from: "system", text: "You created this group", at }],
      },
      ...gs,
    ]);
    return id;
  };

  const renameGroup = (groupId, name) => {
    const value = name.trim();
    if (!value) return;
    setGroups((gs) => gs.map((g) => (g.id === groupId ? { ...g, name: value } : g)));
  };

  const addMembers = (groupId, ids) => {
    const names = ids
      .map((id) => peopleById[id]?.name.split(" ")[0])
      .filter(Boolean)
      .join(", ");
    setGroups((gs) =>
      gs.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              members: [...new Set([...g.members, ...ids])],
              messages: [
                ...g.messages,
                { id: uid(), from: "system", text: `You added ${names}`, at: Date.now() },
              ],
            }
      )
    );
  };

  const removeMember = (groupId, id) => {
    const name = peopleById[id]?.name.split(" ")[0] ?? "a member";
    setGroups((gs) =>
      gs.map((g) =>
        g.id !== groupId
          ? g
          : {
              ...g,
              members: g.members.filter((m) => m !== id),
              messages: [
                ...g.messages,
                { id: uid(), from: "system", text: `You removed ${name}`, at: Date.now() },
              ],
            }
      )
    );
  };

  /* ---------------- chat appearance, pins, stars, archive ---------------- */

  const updateMeta = (key, patch) =>
    setMeta((m) => ({ ...m, [key]: { ...m[key], ...patch } }));

  // Returns "pinned" | "unpinned" | "limit"
  const togglePin = (key) => {
    if (pinned.includes(key)) {
      setPinned((p) => p.filter((k) => k !== key));
      return "unpinned";
    }
    if (pinned.length >= MAX_PINS) return "limit";
    setPinned((p) => [...p, key]);
    return "pinned";
  };

  const toggleStar = (key) =>
    setStarred((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  // Archiving also unpins the chat
  const toggleArchive = (key) => {
    if (archived.includes(key)) {
      setArchived((a) => a.filter((k) => k !== key));
    } else {
      setArchived((a) => [...a, key]);
      setPinned((p) => p.filter((k) => k !== key));
    }
  };

  const value = {
    people,
    peopleById,
    connected,
    incoming,
    sent,
    dms,
    groups,
    unread,
    meta,
    pinned,
    starred,
    archived,
    scheduled,
    reactions,
    sendRequest,
    cancelRequest,
    declineRequest,
    acceptRequest,
    markRead,
    sendMessage,
    scheduleMessage,
    cancelScheduled,
    sendScheduledNow,
    toggleReaction,
    createGroup,
    renameGroup,
    addMembers,
    removeMember,
    updateMeta,
    togglePin,
    toggleStar,
    toggleArchive,
  };

  return (
    <ChatDataContext.Provider value={value}>{children}</ChatDataContext.Provider>
  );
}