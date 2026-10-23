// Mock data for the Chats UI. Replace with real API data later.
const now = Date.now();
const ago = (min) => now - min * 60000;

// status: connected | incoming (they asked you) | pending (you asked them) | none
export const initialPeople = [
  { id: "aria", name: "Aria Chen", username: "aria.dev", role: "Frontend developer", avatar: "Aria", online: true, status: "connected" },
  { id: "milo", name: "Milo Santos", username: "milo", role: "Backend developer", avatar: "Milo", online: false, status: "connected" },
  { id: "luna", name: "Luna Reyes", username: "lunar", role: "UI designer", avatar: "Luna", online: true, status: "connected" },
  { id: "felix", name: "Felix Park", username: "felixp", role: "DevOps engineer", avatar: "Felix", online: false, status: "connected" },
  { id: "nova", name: "Nova Ibarra", username: "nova", role: "Full-stack developer", avatar: "Nova", online: true, status: "incoming", note: "Hi! I saw your snippets and would love to share ideas." },
  { id: "orion", name: "Orion Vale", username: "orionv", role: "Mobile developer", avatar: "Orion", online: false, status: "incoming", note: "We're both into React Native. Let's connect!" },
  { id: "willow", name: "Willow Tan", username: "willow", role: "Data engineer", avatar: "Willow", online: false, status: "pending" },
  { id: "atlas", name: "Atlas Moreno", username: "atlas", role: "Backend developer", avatar: "Atlas", online: true, status: "none" },
  { id: "juno", name: "Juno Park", username: "juno", role: "Frontend developer", avatar: "Juno", online: false, status: "none" },
  { id: "sage", name: "Sage Lim", username: "sagel", role: "Product designer", avatar: "Sage", online: true, status: "none" },
  { id: "ember", name: "Ember Cruz", username: "ember", role: "QA engineer", avatar: "Ember", online: false, status: "none" },
  { id: "kai", name: "Kai Navarro", username: "kai.n", role: "Security engineer", avatar: "Kai", online: false, status: "none" },
];

// from: "me" | personId | "system"
export const initialDMs = {
  aria: [
    { id: "a1", from: "aria", text: "Did you try the useDebounce snippet in the search bar?", at: ago(95) },
    { id: "a2", from: "me", text: "Yep, works great. I tagged it under hooks.", at: ago(90) },
    { id: "a3", from: "aria", text: "Nice. Add it to the shared collection so I can grab it.", at: ago(12) },
  ],
  milo: [
    { id: "m1", from: "milo", text: "Pushed the API retry helper to our collection.", at: ago(60 * 26) },
    { id: "m2", from: "me", text: "Thanks! I'll test it with the flaky endpoint tomorrow.", at: ago(60 * 25) },
  ],
  luna: [
    { id: "l1", from: "luna", text: "Quick idea: color-tag snippets by project so they're easier to scan.", at: ago(180) },
    { id: "l2", from: "me", text: "Love that. Want to sketch it together?", at: ago(170) },
    { id: "l3", from: "luna", text: "Sure, I'll share a mockup tonight.", at: ago(165) },
  ],
  felix: [
    { id: "f1", from: "system", text: "You're now connected with Felix Park", at: ago(60 * 48) },
  ],
};

export const initialGroups = [
  {
    id: "g1",
    name: "Frontend crew",
    members: ["aria", "milo", "luna"],
    messages: [
      { id: "g1a", from: "system", text: "You created this group", at: ago(60 * 72) },
      { id: "g1b", from: "aria", text: "Standup notes are in the shared collection.", at: ago(240) },
      { id: "g1c", from: "milo", text: "Thanks! Reviewing the PR after lunch.", at: ago(200) },
      { id: "g1d", from: "luna", text: "I'll join after the design review.", at: ago(30) },
    ],
  },
];

export const initialUnread = {
  "dm:aria": 1,
  "group:g1": 2,
};

export function formatTime(at) {
  const d = new Date(at);
  const n = new Date();
  if (d.toDateString() === n.toDateString()) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const days = (n - d) / 86400000;
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}