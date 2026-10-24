import { getGroupIcon, getTheme } from "./chatOptions";

// Round group badge. The icon uses the theme's text color, so it stays visible
// on every theme color (white on the deeper themes).
export function GroupBadge({ iconId, themeId, size = 40 }) {
  const theme = getTheme(themeId);
  const { icon: Icon } = getGroupIcon(iconId);

  return (
    <span
      style={{ width: size, height: size, backgroundColor: theme.bubble, color: theme.text }}
      className="flex shrink-0 items-center justify-center rounded-full"
    >
      <Icon size={Math.round(size * 0.46)} strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}

export default GroupBadge;