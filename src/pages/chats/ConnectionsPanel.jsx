import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import Avatar from "../../components/Avatar";
import { EmptyState, btnOutline } from "./chatUi";
import { formatAgo, formatDate } from "./chatData";

function Row({ person, active, onOpen }) {
  return (
    <button
      onClick={() => onOpen(person.id)}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        active ? "bg-neutral-100" : "hover:bg-neutral-50"
      }`}
    >
      <Avatar seed={person.avatar} size={36} online={person.online} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px]">{person.name}</span>
        <span className="block truncate text-[11px] text-neutral-500">
          {person.role}
        </span>
      </span>
      {person.connectedAt && (
        <span
          title={`Connected on ${formatDate(person.connectedAt)}`}
          className="shrink-0 text-[10px] text-neutral-400"
        >
          {formatAgo(person.connectedAt)}
        </span>
      )}
    </button>
  );
}

export default function ConnectionsPanel({
  connections,
  activeKey,
  onOpen,
  query = "",
}) {
  const q = query.trim().toLowerCase();
  const list = connections.filter(
    (p) => !q || `${p.name} ${p.username}`.toLowerCase().includes(q)
  );
  const online = list.filter((p) => p.online);
  const offline = list.filter((p) => !p.online);

  if (connections.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No connections yet"
        text="People you connect with will appear here."
        action={
          <Link to="/dashboard/people" className={`${btnOutline} mt-5`}>
            Find people
          </Link>
        }
      />
    );
  }

  if (list.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No connections found"
        text="Try a different name or username."
      />
    );
  }

  return (
    <div className="space-y-4">
      {online.length > 0 && (
        <div>
          {/* Green text only; the green dot stays on avatars */}
          <p className="px-3 pb-1 text-[11px] text-emerald-600">
            Online ({online.length})
          </p>
          {online.map((p) => (
            <Row
              key={p.id}
              person={p}
              active={activeKey === `dm:${p.id}`}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
      {offline.length > 0 && (
        <div>
          <p className="px-3 pb-1 text-[11px] text-neutral-400">
            Offline ({offline.length})
          </p>
          {offline.map((p) => (
            <Row
              key={p.id}
              person={p}
              active={activeKey === `dm:${p.id}`}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}