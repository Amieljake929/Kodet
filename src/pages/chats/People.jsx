import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Clock, MessageSquare, Search, UserPlus, X } from "lucide-react";
import { EmptyState, PersonRow, btnOutline, btnPrimary } from "./chatUi";
import { useChatData } from "./chatStore";

const tabs = [
  { id: "requests", label: "Requests" },
  { id: "discover", label: "Discover" },
];

export default function People() {
  const navigate = useNavigate();
  const {
    people,
    incoming,
    sent,
    sendRequest,
    cancelRequest,
    declineRequest,
    acceptRequest,
  } = useChatData();

  const [tab, setTab] = useState("requests");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = (list) =>
    list.filter((p) => !q || `${p.name} ${p.username}`.toLowerCase().includes(q));

  const openChat = (id) =>
    navigate("/dashboard/chats", { state: { open: `dm:${id}` } });

  const renderRequests = () => {
    const inc = visible(incoming);
    const out = visible(sent);

    if (inc.length === 0 && out.length === 0) {
      return (
        <EmptyState
          icon={UserPlus}
          title={q ? "No requests found" : "No requests"}
          text={
            q
              ? "Try a different name."
              : "Connection requests you send or receive will show up here."
          }
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
                <PersonRow person={p}>
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
    const list = visible(people);
    if (list.length === 0) {
      return (
        <EmptyState
          icon={Search}
          title="No people found"
          text="Try a different name or username."
        />
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
              <button onClick={() => openChat(p.id)} className={btnOutline}>
                <span className="flex items-center gap-1.5">
                  <MessageSquare size={13} />
                  Message
                </span>
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
      <h1 className="text-3xl font-medium tracking-tight">People</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Review connection requests and find people to connect with.{" "}
        <Link to="/dashboard/chats" className="underline underline-offset-4">
          Back to chats
        </Link>
      </p>

      <div className="mt-8 max-w-3xl overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center">
          <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 sm:w-[280px]">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setQuery("");
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs transition-colors ${
                  tab === t.id ? "bg-white shadow-sm" : "text-neutral-500 hover:text-black"
                }`}
              >
                {t.label}
                {t.id === "requests" && incoming.length > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                    {incoming.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <label className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus-within:border-black">
            <Search size={15} className="shrink-0 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people"
              className="w-full bg-transparent text-xs outline-none placeholder:text-neutral-400"
            />
          </label>
        </div>

        <div className="mt-3 px-2 pb-3">
          {tab === "requests" ? renderRequests() : renderDiscover()}
        </div>
      </div>
    </motion.div>
  );
}