/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// LOCAL STORAGE FIREBASE ADAPTER
// Completely removes dependency on live Firebase servers.
// 100% Free, zero configuration, zero popup errors, works immediately on Netlify!

export interface FirebaseUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  isAnonymous: boolean;
  photoURL: string | null;
}

// Global reference for auth state
class MockAuth {
  private _currentUser: FirebaseUser | null = null;
  private _authStateListeners = new Set<(user: FirebaseUser | null) => void>();

  constructor() {
    // Load persisted auth user from localStorage if exists
    const persisted = localStorage.getItem('lunefunhub_current_user');
    if (persisted) {
      try {
        this._currentUser = JSON.parse(persisted);
      } catch (e) {
        this._currentUser = null;
      }
    }
  }

  get currentUser() {
    return this._currentUser;
  }

  set currentUser(user: FirebaseUser | null) {
    this._currentUser = user;
    if (user) {
      localStorage.setItem('lunefunhub_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lunefunhub_current_user');
    }
    this._authStateListeners.forEach(fn => fn(user));
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    this._authStateListeners.add(callback);
    // Execute immediately with the current state
    callback(this._currentUser);
    return () => {
      this._authStateListeners.delete(callback);
    };
  }
}

export const auth = new MockAuth();
export const googleProvider = { type: 'google_provider' };
export const db = { type: 'local_storage_db' };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// ---------------- LOCAL DATABASE STORES ----------------
const DB_STORE_KEY = 'lunefunhub_local_db';

const SEED_DATA: Record<string, any> = {
  "board_posts/seed_post_3": {
    id: "seed_post_3",
    authorId: "user_alex",
    authorName: "Alex 🐾",
    authorAvatar: "🎮",
    content: "So excited to join the LUNÉ Fun Hub! Let's play some Flappy Wolf and share our high scores! 🌕🐾",
    type: "text",
    category: "chat",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
  }
};

function getLocalDBStore(): Record<string, any> {
  const data = localStorage.getItem(DB_STORE_KEY);
  let parsed: Record<string, any> = {};
  if (!data) {
    parsed = { ...SEED_DATA };
    localStorage.setItem(DB_STORE_KEY, JSON.stringify(parsed));
  } else {
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      parsed = { ...SEED_DATA };
    }
  }

  // Explicitly remove seed_post_1 and seed_post_2 if they exist in localStorage as requested by the user
  let changed = false;
  if (parsed["board_posts/seed_post_1"]) {
    delete parsed["board_posts/seed_post_1"];
    changed = true;
  }
  if (parsed["board_posts/seed_post_2"]) {
    delete parsed["board_posts/seed_post_2"];
    changed = true;
  }
  if (changed) {
    localStorage.setItem(DB_STORE_KEY, JSON.stringify(parsed));
  }

  return parsed;
}

function saveLocalDBStore(store: Record<string, any>) {
  localStorage.setItem(DB_STORE_KEY, JSON.stringify(store));
}

// Pub/Sub for database reactivity
interface SnapshotListener {
  path: string;
  isDoc: boolean;
  callback: (snapshot: any) => void;
}
const activeListeners = new Set<SnapshotListener>();

function triggerListeners(path: string) {
  activeListeners.forEach(listener => {
    // Trigger if the updated path matches or is a child/parent of the listener path
    if (
      path === listener.path ||
      path.startsWith(listener.path + '/') ||
      listener.path.startsWith(path + '/')
    ) {
      try {
        if (listener.isDoc) {
          listener.callback(getDocSnapshot(listener.path));
        } else {
          listener.callback(getCollectionSnapshot(listener.path));
        }
      } catch (err) {
        console.error("Error executing snapshot listener:", err);
      }
    }
  });
}

function getDocSnapshot(path: string) {
  const store = getLocalDBStore();
  const data = store[path];
  const parts = path.split('/');
  const id = parts[parts.length - 1];
  return {
    exists: () => !!data,
    data: () => data ? { ...data } : null,
    id,
    ref: { path, id }
  };
}

function getCollectionSnapshot(path: string) {
  const store = getLocalDBStore();
  const prefix = path + '/';
  const docs: any[] = [];
  
  for (const [key, val] of Object.entries(store)) {
    if (key.startsWith(prefix)) {
      const remaining = key.substring(prefix.length);
      // Ensure direct child (no extra slashes)
      if (!remaining.includes('/')) {
        docs.push({ id: remaining, ...val });
      }
    }
  }

  // Sort: replies ascend (oldest first), posts and notifications descend (newest first)
  docs.sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (path.includes('replies')) {
      return tA - tB;
    }
    return tB - tA;
  });

  return {
    forEach: (callback: (doc: any) => void) => {
      docs.forEach(doc => {
        callback({
          id: doc.id,
          data: () => ({ ...doc }),
          ref: { path: `${path}/${doc.id}`, id: doc.id }
        });
      });
    },
    docs: docs.map(doc => ({
      id: doc.id,
      data: () => ({ ...doc }),
      ref: { path: `${path}/${doc.id}`, id: doc.id }
    }))
  };
}

// ---------------- FIRESTORE API MOCKS ----------------

export function doc(_db: any, collectionPath: string, docId?: string, ...segments: string[]) {
  let fullPath = collectionPath;
  if (docId) fullPath += '/' + docId;
  if (segments.length > 0) fullPath += '/' + segments.join('/');
  
  const parts = fullPath.split('/');
  const id = parts[parts.length - 1];
  return { type: 'doc', path: fullPath, id };
}

export function collection(_db: any, collectionPath: string, ...segments: string[]) {
  let fullPath = collectionPath;
  if (segments.length > 0) fullPath += '/' + segments.join('/');
  return { type: 'collection', path: fullPath };
}

export async function getDoc(docRef: { path: string; id: string }) {
  return getDocSnapshot(docRef.path);
}

export async function getDocs(queryRef: { path: string }) {
  return getCollectionSnapshot(queryRef.path);
}

export async function setDoc(docRef: { path: string; id: string }, data: any, options?: { merge?: boolean }) {
  const store = getLocalDBStore();
  const existing = store[docRef.path] || {};
  store[docRef.path] = options?.merge ? { ...existing, ...data } : { ...data };
  saveLocalDBStore(store);
  triggerListeners(docRef.path);
}

export async function updateDoc(docRef: { path: string; id: string }, data: any) {
  const store = getLocalDBStore();
  const existing = store[docRef.path] || {};
  store[docRef.path] = { ...existing, ...data };
  saveLocalDBStore(store);
  triggerListeners(docRef.path);
}

export async function deleteDoc(docRef: { path: string; id: string }) {
  const store = getLocalDBStore();
  delete store[docRef.path];
  
  // Recursively delete subcollections
  const prefix = docRef.path + '/';
  for (const key of Object.keys(store)) {
    if (key.startsWith(prefix)) {
      delete store[key];
    }
  }
  
  saveLocalDBStore(store);
  triggerListeners(docRef.path);
}

export async function addDoc(collectionRef: { path: string }, data: any) {
  const store = getLocalDBStore();
  const id = Math.random().toString(36).substring(2, 11);
  const docPath = `${collectionRef.path}/${id}`;
  
  const cleanData = { ...data };
  if (!cleanData.createdAt) {
    cleanData.createdAt = new Date().toISOString();
  }
  
  store[docPath] = { ...cleanData, id };
  saveLocalDBStore(store);
  triggerListeners(collectionRef.path);
  return { id };
}

export function query(ref: any, ..._constraints: any[]) {
  // Pass-through the ref for simple query handling
  return ref;
}

export function orderBy(_field: string, _direction?: 'asc' | 'desc') {
  return { type: 'orderBy', field: _field, direction: _direction };
}

export function limit(_n: number) {
  return { type: 'limit', value: _n };
}

export function serverTimestamp() {
  return new Date().toISOString();
}

export function onSnapshot(ref: any, callback: (snapshot: any) => void, onError?: (error: any) => void) {
  const isDoc = ref.type === 'doc';
  const listener: SnapshotListener = { path: ref.path, isDoc, callback };
  activeListeners.add(listener);
  
  // Execute snapshot query immediately
  try {
    const snap = isDoc ? getDocSnapshot(ref.path) : getCollectionSnapshot(ref.path);
    callback(snap);
  } catch (err) {
    if (onError) onError(err);
  }

  // Return unsubscribe handle
  return () => {
    activeListeners.delete(listener);
  };
}

// ---------------- AUTH API MOCKS ----------------

export function onAuthStateChanged(_auth: MockAuth, callback: (user: FirebaseUser | null) => void) {
  return auth.onAuthStateChanged(callback);
}

export async function signInAnonymously(_auth: MockAuth) {
  const guestId = 'guest_' + Math.random().toString(36).substring(2, 11);
  const guestUser: FirebaseUser = {
    uid: guestId,
    displayName: 'Guest Wolf',
    email: null,
    isAnonymous: true,
    photoURL: null
  };
  auth.currentUser = guestUser;
  return { user: guestUser };
}

export async function signInWithNickname(nickname: string) {
  if (!nickname || !nickname.trim()) {
    throw new Error("Invalid nickname.");
  }
  const cleanName = nickname.trim();
  const uid = 'user_' + cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Try to see if this user profile already exists to maintain account persistence!
  const store = getLocalDBStore();
  const userPath = `users/${uid}`;
  const existingUser = store[userPath];
  
  const user: FirebaseUser = {
    uid,
    displayName: existingUser?.name || cleanName,
    email: null,
    isAnonymous: false,
    photoURL: null
  };
  
  auth.currentUser = user;
  return { user };
}

export async function signInWithPopup(_auth: MockAuth, _provider: any) {
  const nickname = prompt("Enter your magical LUNÉ nickname to register or log in:", "");
  if (!nickname || !nickname.trim()) {
    throw new Error("Login cancelled or invalid nickname.");
  }
  return signInWithNickname(nickname);
}

export async function signOut(_auth: MockAuth) {
  auth.currentUser = null;
}

// ---------------- SECURE WRAPPER API ----------------

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`LocalDB [${operationType}] Error on path: ${path}`, error);
}

export async function saveUserData(uid: string, data: any) {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, data, { merge: true });
}

export async function getUserData(uid: string) {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}
