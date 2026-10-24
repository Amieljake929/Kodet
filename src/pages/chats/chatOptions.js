import { createElement } from "react";
import {
  Users,
  Code2,
  Hash,
  Rocket,
  Coffee,
  Sparkles,
  Heart,
  Zap,
  Laugh,
  ThumbsUp,
} from "lucide-react";

export const MAX_PINS = 5;

// Deeper, muted tones with white text. "default" keeps the original black bubbles.
// Themes only affect the bubbles you send (and the group badge). The conversation
// background never changes. `sub` is the color of the time/ticks inside a bubble.
const SUB = "rgba(255,255,255,0.72)";
export const chatThemes = [
  { id: "default", name: "Default", bubble: "#000000", text: "#ffffff", sub: SUB, swatch: "#000000" },
  { id: "sky", name: "Sky", bubble: "#2F6FB0", text: "#ffffff", sub: SUB, swatch: "#2F6FB0" },
  { id: "mint", name: "Mint", bubble: "#2E8B6A", text: "#ffffff", sub: SUB, swatch: "#2E8B6A" },
  { id: "peach", name: "Peach", bubble: "#BF5B30", text: "#ffffff", sub: SUB, swatch: "#BF5B30" },
  { id: "lavender", name: "Lavender", bubble: "#7561C9", text: "#ffffff", sub: SUB, swatch: "#7561C9" },
  { id: "rose", name: "Rose", bubble: "#C94F78", text: "#ffffff", sub: SUB, swatch: "#C94F78" },
  { id: "butter", name: "Amber", bubble: "#A87608", text: "#ffffff", sub: SUB, swatch: "#A87608" },
  { id: "stone", name: "Stone", bubble: "#57534E", text: "#ffffff", sub: SUB, swatch: "#57534E" },
];

export const getTheme = (id) =>
  chatThemes.find((t) => t.id === id) || chatThemes[0];

export const groupIcons = [
  { id: "users", label: "People", icon: Users },
  { id: "code", label: "Code", icon: Code2 },
  { id: "hash", label: "Channel", icon: Hash },
  { id: "rocket", label: "Launch", icon: Rocket },
  { id: "coffee", label: "Casual", icon: Coffee },
  { id: "sparkles", label: "Ideas", icon: Sparkles },
  { id: "heart", label: "Favorites", icon: Heart },
  { id: "zap", label: "Quick", icon: Zap },
];

export const getGroupIcon = (id) =>
  groupIcons.find((i) => i.id === id) || groupIcons[0];

// Message reactions: refined line icons (hardcoded, no external API, no emoji).
// The ids stay the same ("heart", "haha", "ok") so existing data keeps working.
// `emoji` holds a React element, so anywhere that renders {x.emoji} still works.
const icon = (Icon, className, extra = {}) =>
  createElement(Icon, { size: 15, strokeWidth: 1.75, className, "aria-hidden": true, ...extra });

export const REACTIONS = [
  { id: "heart", label: "Heart", emoji: icon(Heart, "text-rose-600", { fill: "currentColor" }) },
  { id: "haha", label: "Haha", emoji: icon(Laugh, "text-amber-600") },
  { id: "ok", label: "OK", emoji: icon(ThumbsUp, "text-sky-700") },
];