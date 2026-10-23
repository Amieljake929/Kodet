import { useState } from "react";
import { Users } from "lucide-react";
import { avatarUrl } from "../lib/avatars";

export default function Avatar({ seed, name, size = 40, online, className = "" }) {
  const [failed, setFailed] = useState(false);
  const letter = (name || seed || "?").charAt(0).toUpperCase();

  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {failed ? (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 text-sm">
          {letter}
        </span>
      ) : (
        <img
          src={avatarUrl(seed || name)}
          alt=""
          loading="lazy"
          draggable={false}
          onError={() => setFailed(true)}
          className="h-full w-full rounded-full bg-neutral-200 object-cover"
        />
      )}
      {online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </span>
  );
}

export function GroupAvatar({ size = 40, className = "" }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 ${className}`}
      style={{ width: size, height: size }}
    >
      <Users size={Math.round(size * 0.45)} />
    </span>
  );
}