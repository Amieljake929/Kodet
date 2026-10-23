// DiceBear "Notionists" avatars. The avatar name is also its seed.
// Docs: https://www.dicebear.com/styles/notionists/
const names = [
  "Aria", "Milo", "Luna", "Felix", "Nova", "Orion", "Willow", "Atlas",
  "Juno", "Pixel", "Sage", "Ember", "Kai", "Zara", "Leo", "Maya",
  "Theo", "Ivy", "Ravi", "Skye", "Finn", "Nora", "Ezra", "Piper",
  "Jasper", "Cleo", "Rhea", "Otis", "Wren", "Dash", "Mira", "Hugo",
];

export const avatars = names.map((name) => ({ name }));

export const avatarUrl = (seed) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
    seed || "Kodet"
  )}&backgroundColor=ececec`;