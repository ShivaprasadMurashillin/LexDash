/**
 * userStore.js
 * Manages attorney user accounts in localStorage.
 * All users (including login credentials) are stored here.
 * On first run, seeds 5 default users.
 */

const USERS_KEY = 'lexdash_users';
const USERS_VERSION_KEY = 'lexdash_users_version';
const CURRENT_VERSION = 2; // bump to force localStorage refresh

const DEFAULT_USERS = [
  {
    id: '1',
    email: 'admin@lexdash.com',
    password: 'LexDash2026',
    name: 'Elena Novak',
    role: 'Senior Partner',
    phone: '+1 (929) 555-0301',
    nationality: 'American',
    isAdmin: true,
    joinedDate: '2019-04-10',
  },
  {
    id: '2',
    email: 'marcus@lexdash.com',
    password: 'LexDash2026',
    name: 'Marcus Garrison',
    role: 'Partner',
    phone: '+1 (713) 555-0302',
    nationality: 'American',
    isAdmin: false,
    joinedDate: '2019-08-22',
  },
  {
    id: '3',
    email: 'isabela@lexdash.com',
    password: 'LexDash2026',
    name: 'Isabela de la Cruz',
    role: 'Associate Attorney',
    phone: '+1 (786) 555-0303',
    nationality: 'Colombian',
    isAdmin: false,
    joinedDate: '2021-01-15',
  },
  {
    id: '4',
    email: 'chidi@lexdash.com',
    password: 'LexDash2026',
    name: 'Chidi Okonkwo',
    role: 'Associate Attorney',
    phone: '+1 (404) 555-0304',
    nationality: 'Nigerian',
    isAdmin: false,
    joinedDate: '2021-07-05',
  },
  {
    id: '5',
    email: 'fiona@lexdash.com',
    password: 'LexDash2026',
    name: 'Fiona Brennan',
    role: 'Junior Associate',
    phone: '+1 (504) 555-0305',
    nationality: 'Irish',
    isAdmin: false,
    joinedDate: '2023-03-18',
  },
];

export function getUsers() {
  try {
    const storedVersion = parseInt(localStorage.getItem(USERS_VERSION_KEY) || '0', 10);
    if (storedVersion < CURRENT_VERSION) {
      // Version changed — re-seed defaults
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(USERS_VERSION_KEY, String(CURRENT_VERSION));
      return DEFAULT_USERS;
    }
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
    // First run — seed defaults
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(USERS_VERSION_KEY, String(CURRENT_VERSION));
    return DEFAULT_USERS;
  } catch {
    return [...DEFAULT_USERS];
  }
}

/** Get the currently logged-in user's name. */
export function getCurrentUserName() {
  try {
    const raw = localStorage.getItem('lexdash_auth');
    if (raw) return JSON.parse(raw).name || '';
  } catch { /* ignore */ }
  return '';
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Find a user by email + password for login. Returns user or null. */
export function findUser(email, password) {
  return (
    getUsers().find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.password === password
    ) || null
  );
}

export function getUserById(id) {
  return getUsers().find((u) => u.id === id) || null;
}

/** Update fields on a user. Returns the updated user, or null if not found. */
export function updateUser(id, updates) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return users[idx];
}

/** Add a new user. Returns the new user, or { error } if email is already taken. */
export function addUser(data) {
  const users = getUsers();
  if (
    users.some(
      (u) => u.email.toLowerCase() === data.email.toLowerCase().trim()
    )
  ) {
    return { error: 'A user with this email already exists.' };
  }
  const newUser = {
    id: Date.now().toString(),
    isAdmin: false,
    phone: '',
    nationality: '',
    joinedDate: new Date().toISOString().split('T')[0],
    ...data,
    email: data.email.toLowerCase().trim(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

/** Delete a user by id. */
export function deleteUser(id) {
  const users = getUsers().filter((u) => u.id !== id);
  saveUsers(users);
}
