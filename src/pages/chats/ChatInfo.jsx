import { useEffect, useState } from "react";
import {
  X,
  Pin,
  Star,
  Archive,
  Pencil,
  Check,
  UserPlus,
  Minus,
} from "lucide-react";
import Avatar from "../../components/Avatar";
import { GroupBadge, btnPrimary, btnOutline } from "./chatUi";
import { chatThemes, groupIcons, MAX_PINS } from "./chatOptions";
import { useChatData } from "./chatStore";
import { formatAgo, formatDate } from "./chatData";

function Section({ title, aside, children }) {
  return (
    <section className="border-t border-neutral-200 px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[13px]">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Detail({ label, value, sub, valueClass = "" }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-[11px] text-neutral-500">{label}</span>
      <span className="text-right">
        <span className={`block text-[12px] ${valueClass}`}>{value}</span>
        {sub && <span className="block text-[10px] text-neutral-400">{sub}</span>}
      </span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] transition-colors ${
        active
          ? "border-neutral-400 bg-neutral-100"
          : "border-neutral-200 hover:bg-neutral-50"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

export default function ChatInfo({
  conversation,
  me,
  meta,
  isPinned,
  isStarred,
  isArchived,
  pinnedCount,
  onClose,
}) {
  const {
    connected,
    peopleById,
    togglePin,
    toggleStar,
    toggleArchive,
    updateMeta,
    renameGroup,
    addMembers,
    removeMember,
  } = useChatData();

  const isGroup = conversation.type === "group";
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(conversation.title);
  const [adding, setAdding] = useState(false);
  const [pinNote, setPinNote] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handlePin = () => {
    const result = togglePin(conversation.key);
    setPinNote(
      result === "limit"
        ? `You can pin up to ${MAX_PINS} chats. Unpin one first.`
        : ""
    );
  };

  const saveName = () => {
    renameGroup(conversation.id, name);
    setEditing(false);
  };

  const candidates = isGroup
    ? connected.filter((p) => !conversation.members.includes(p.id))
    : [];

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-[13px]">{isGroup ? "Group info" : "Chat info"}</h2>
        <button
          onClick={onClose}
          aria-label="Close info"
          className="rounded-lg p-1.5 transition-colors hover:bg-neutral-100"
        >
          <X size={16} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Profile */}
        <div className="flex flex-col items-center px-5 pb-5 text-center">
          {isGroup ? (
            <GroupBadge iconId={meta.icon} themeId={meta.theme} size={64} />
          ) : (
            <Avatar
              seed={conversation.person.avatar}
              size={64}
              online={conversation.person.online}
            />
          )}

          {editing ? (
            <div className="mt-3 flex w-full items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                aria-label="Group name"
                maxLength={40}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-black"
              />
              <button onClick={saveName} aria-label="Save name" className={btnPrimary}>
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="mt-3 flex max-w-full items-center gap-1.5">
              <p className="truncate text-sm">{conversation.title}</p>
              {isGroup && (
                <button
                  onClick={() => {
                    setName(conversation.title);
                    setEditing(true);
                  }}
                  aria-label="Rename group"
                  className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
          )}

          <p className="mt-0.5 text-[11px] text-neutral-500">
            {isGroup
              ? `${conversation.members.length + 1} members`
              : conversation.person.role}
          </p>

          <div className="mt-4 flex w-full gap-2">
            <ActionButton
              icon={Pin}
              label={isPinned ? "Unpin" : "Pin"}
              active={isPinned}
              onClick={handlePin}
            />
            <ActionButton
              icon={Star}
              label={isStarred ? "Starred" : "Star"}
              active={isStarred}
              onClick={() => toggleStar(conversation.key)}
            />
            <ActionButton
              icon={Archive}
              label={isArchived ? "Unarchive" : "Archive"}
              active={isArchived}
              onClick={() => toggleArchive(conversation.key)}
            />
          </div>
          <p className="mt-2 text-[10px] text-neutral-400">
            Pinned {pinnedCount}/{MAX_PINS}
          </p>
          {pinNote && (
            <p role="status" className="mt-1 text-[11px] text-neutral-500">
              {pinNote}
            </p>
          )}
        </div>

        {/* About */}
        <Section title="About">
          {isGroup ? (
            <>
              <Detail
                label="Created"
                value={formatDate(conversation.createdAt)}
                sub={formatAgo(conversation.createdAt)}
              />
              <Detail label="Members" value={conversation.members.length + 1} />
            </>
          ) : (
            <>
              <Detail label="Username" value={`@${conversation.person.username}`} />
              <Detail label="Role" value={conversation.person.role} />
              <Detail
                label="Status"
                value={conversation.person.online ? "Online" : "Offline"}
                valueClass={conversation.person.online ? "text-emerald-600" : ""}
              />
              {conversation.person.connectedAt && (
                <Detail
                  label="Connected since"
                  value={formatDate(conversation.person.connectedAt)}
                  sub={formatAgo(conversation.person.connectedAt)}
                />
              )}
            </>
          )}
        </Section>

        {/* Theme */}
        <Section title="Theme">
          <div className="grid grid-cols-4 gap-y-3">
            {chatThemes.map((t) => {
              const active = (meta.theme || "default") === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => updateMeta(conversation.key, { theme: t.id })}
                  aria-pressed={active}
                  aria-label={`${t.name} theme`}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    style={{ backgroundColor: t.swatch }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-shadow ${
                      active
                        ? "border-black ring-2 ring-black/10"
                        : "border-neutral-200"
                    }`}
                  >
                    {active && (
                      <Check size={13} className="text-white" />
                    )}
                  </span>
                  <span className="text-[10px] text-neutral-500">{t.name}</span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Group icon */}
        {isGroup && (
          <Section title="Group icon">
            <div className="grid grid-cols-4 gap-2">
              {groupIcons.map(({ id, label, icon: Icon }) => {
                const active = (meta.icon || "users") === id;
                return (
                  <button
                    key={id}
                    onClick={() => updateMeta(conversation.key, { icon: id })}
                    aria-pressed={active}
                    aria-label={label}
                    title={label}
                    className={`flex h-10 items-center justify-center rounded-xl border transition-colors ${
                      active
                        ? "border-black bg-neutral-100"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Members */}
        {isGroup && (
          <Section
            title={`Members (${conversation.members.length + 1})`}
            aside={
              <button
                onClick={() => setAdding((v) => !v)}
                aria-expanded={adding}
                className={`${btnOutline} flex items-center gap-1.5`}
              >
                <UserPlus size={13} />
                {adding ? "Done" : "Add people"}
              </button>
            }
          >
            {adding && (
              <div className="mb-3 rounded-xl border border-neutral-200 p-1.5">
                {candidates.length === 0 ? (
                  <p className="px-3 py-3 text-[11px] text-neutral-500">
                    Everyone you're connected with is already in this group.
                  </p>
                ) : (
                  candidates.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-lg px-2 py-2">
                      <Avatar seed={p.avatar} size={30} online={p.online} />
                      <span className="min-w-0 flex-1 truncate text-[13px]">{p.name}</span>
                      <button
                        onClick={() => addMembers(conversation.id, [p.id])}
                        className={btnPrimary}
                      >
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            <ul className="space-y-0.5">
              <li className="flex items-center gap-3 rounded-lg px-2 py-2">
                <Avatar seed={me?.avatar} size={30} />
                <span className="min-w-0 flex-1 truncate text-[13px]">You</span>
                <span className="text-[11px] text-neutral-400">Admin</span>
              </li>
              {conversation.members.map((id) => {
                const p = peopleById[id];
                if (!p) return null;
                return (
                  <li
                    key={id}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-neutral-50"
                  >
                    <Avatar seed={p.avatar} size={30} online={p.online} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">{p.name}</span>
                      <span className="block truncate text-[11px] text-neutral-500">
                        {p.role}
                      </span>
                    </span>
                    <button
                      onClick={() => removeMember(conversation.id, id)}
                      aria-label={`Remove ${p.name}`}
                      className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
                    >
                      <Minus size={12} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}
      </div>
    </>
  );
}