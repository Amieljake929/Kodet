import Avatar from "../../components/Avatar";
import { getGroupIcon, getTheme } from "./chatOptions";

export const btnPrimary =
  "rounded-lg bg-black px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-80";
export const btnOutline =
  "rounded-lg border border-neutral-300 px-3 py-1.5 text-xs transition-colors hover:bg-neutral-100";

export function EmptyState({ icon: Icon, title, text, action }) {
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

export function PersonRow({ person, subtitle, children }) {
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

// Group avatar: minimal icon on the chat's chosen light color
export function GroupBadge({ iconId, themeId, size = 44 }) {
  const Icon = getGroupIcon(iconId).icon;
  const theme = getTheme(themeId);
  const tinted = theme.id !== "default";

  return (
    <span
      style={{
        width: size,
        height: size,
        backgroundColor: tinted ? theme.bubble : undefined,
      }}
      className={`flex shrink-0 items-center justify-center rounded-full border border-neutral-200 ${
        tinted ? "" : "bg-white"
      }`}
    >
      <Icon size={Math.round(size * 0.42)} />
    </span>
  );
}