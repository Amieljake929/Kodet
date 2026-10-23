// Temporary front-end only "auth". Replace with your real backend later.
const KEY = "kodet-user";
let memoryUser = null; // fallback if localStorage is unavailable

export function getUser() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return memoryUser;
}

export function saveUser(user) {
  memoryUser = user;
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
  return user;
}

export function clearUser() {
  memoryUser = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// Any email + password works for now. Keeps the saved profile if the email matches.
export function signInAs(email) {
  const existing = getUser();
  const same = existing && existing.email === email;
  return saveUser({
    ...(same ? existing : {}),
    name: same && existing.name ? existing.name : email.split("@")[0],
    email,
  });
}