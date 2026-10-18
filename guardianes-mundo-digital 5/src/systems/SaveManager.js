import { SAVE_KEY, SETTINGS_KEY, SAVE_VERSION, LEVELS } from '../config.js';
import rewards from '../data/rewards.json';
import missions from '../data/missions.json';

// Guardado local del progreso. No se guarda ningún dato personal:
// solo progreso del juego, apariencia elegida y preferencias.

const KNOWN_ITEMS = new Set(Object.keys(rewards.items));
const KNOWN_BADGES = new Set(Object.keys(rewards.badges));
const KNOWN_CRYSTALS = new Set(Object.keys(rewards.crystals));
const KNOWN_MISSIONS = new Set(missions.missions.map((m) => m.id));
const MAX_LEVEL = LEVELS.length;

export const AVATAR_LIMITS = { skin: 6, hair: 6, hairStyle: 3, outfit: 6 };

export function defaultProgress() {
  return {
    version: SAVE_VERSION,
    started: false,
    unlockedLevel: 1,
    currentLevel: 1,
    checkpoints: {},
    completedMissions: [],
    levelsCompleted: [],
    inventory: [],
    badges: [],
    crystals: [],
    flags: {},
    avatar: { skin: 1, hair: 0, hairStyle: 0, outfit: 0 },
    stats: { orbs: 0 }
  };
}

export function defaultSettings() {
  return {
    version: SAVE_VERSION,
    musicVolume: 0.5,
    sfxVolume: 0.8,
    muted: false,
    textSize: 'normal', // normal | large
    textSpeed: 'normal', // slow | normal | instant
    reducedMotion: false,
    touchControls: 'auto' // auto | always | never
  };
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const clampInt = (v, min, max, fallback) => (Number.isInteger(v) && v >= min && v <= max ? v : fallback);
const clampNum = (v, min, max, fallback) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback);
const pickEnum = (v, options, fallback) => (options.includes(v) ? v : fallback);
const uniqueKnown = (arr, known) => (Array.isArray(arr) ? [...new Set(arr.filter((x) => typeof x === 'string' && known.has(x)))] : []);

// Migraciones entre versiones del formato de guardado.
const MIGRATIONS = {
  // 1: (data) => ({ ...data, nuevoCampo: valor })
};

function migrate(data) {
  let version = Number.isInteger(data.version) ? data.version : 0;
  let current = { ...data };
  while (version < SAVE_VERSION) {
    const step = MIGRATIONS[version];
    if (step) current = step(current);
    version += 1;
  }
  current.version = SAVE_VERSION;
  return current;
}

export function sanitizeProgress(raw) {
  const base = defaultProgress();
  if (!isObj(raw)) return base;
  // Datos de una versión futura o antigua: se migran y se conservan los campos compatibles.
  const data = migrate(raw);
  const out = base;
  out.started = data.started === true;
  out.unlockedLevel = clampInt(data.unlockedLevel, 1, MAX_LEVEL, 1);
  out.currentLevel = clampInt(data.currentLevel, 1, out.unlockedLevel, 1);
  if (isObj(data.checkpoints)) {
    for (const [lvl, cp] of Object.entries(data.checkpoints)) {
      const n = Number(lvl);
      if (Number.isInteger(n) && n >= 1 && n <= MAX_LEVEL && Number.isInteger(cp) && cp >= 0 && cp < 50) out.checkpoints[n] = cp;
    }
  }
  out.completedMissions = uniqueKnown(data.completedMissions, KNOWN_MISSIONS);
  out.levelsCompleted = Array.isArray(data.levelsCompleted)
    ? [...new Set(data.levelsCompleted.filter((n) => Number.isInteger(n) && n >= 1 && n <= MAX_LEVEL))]
    : [];
  out.inventory = uniqueKnown(data.inventory, KNOWN_ITEMS);
  out.badges = uniqueKnown(data.badges, KNOWN_BADGES);
  out.crystals = uniqueKnown(data.crystals, KNOWN_CRYSTALS);
  if (isObj(data.flags)) {
    for (const [k, v] of Object.entries(data.flags)) {
      if (typeof k === 'string' && k.length < 64 && typeof v === 'boolean') out.flags[k] = v;
    }
  }
  if (isObj(data.avatar)) {
    out.avatar = {
      skin: clampInt(data.avatar.skin, 0, AVATAR_LIMITS.skin - 1, base.avatar.skin),
      hair: clampInt(data.avatar.hair, 0, AVATAR_LIMITS.hair - 1, base.avatar.hair),
      hairStyle: clampInt(data.avatar.hairStyle, 0, AVATAR_LIMITS.hairStyle - 1, base.avatar.hairStyle),
      outfit: clampInt(data.avatar.outfit, 0, AVATAR_LIMITS.outfit - 1, base.avatar.outfit)
    };
  }
  if (isObj(data.stats)) out.stats.orbs = clampInt(data.stats.orbs, 0, 100000, 0);
  return out;
}

export function sanitizeSettings(raw) {
  const base = defaultSettings();
  if (!isObj(raw)) return base;
  return {
    version: SAVE_VERSION,
    musicVolume: clampNum(raw.musicVolume, 0, 1, base.musicVolume),
    sfxVolume: clampNum(raw.sfxVolume, 0, 1, base.sfxVolume),
    muted: raw.muted === true,
    textSize: pickEnum(raw.textSize, ['normal', 'large'], base.textSize),
    textSpeed: pickEnum(raw.textSpeed, ['slow', 'normal', 'instant'], base.textSpeed),
    reducedMotion: raw.reducedMotion === true,
    touchControls: pickEnum(raw.touchControls, ['auto', 'always', 'never'], base.touchControls)
  };
}

class Storage {
  constructor() {
    this.memory = {};
    this.available = false;
    try {
      const k = '__gmd_test__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      this.available = true;
    } catch {
      this.available = false; // Navegación privada o almacenamiento bloqueado: se usa memoria.
    }
  }
  get(key) {
    if (!this.available) return this.memory[key] ?? null;
    try { return window.localStorage.getItem(key); } catch { return this.memory[key] ?? null; }
  }
  set(key, value) {
    this.memory[key] = value;
    if (!this.available) return;
    try { window.localStorage.setItem(key, value); } catch { /* cuota llena: se mantiene en memoria */ }
  }
  remove(key) {
    delete this.memory[key];
    if (!this.available) return;
    try { window.localStorage.removeItem(key); } catch { /* sin acceso */ }
  }
}

class SaveManager {
  constructor() {
    this.storage = new Storage();
    this.listeners = new Set();
    this.progress = this.readProgress();
    this.settings = this.readSettings();
  }

  readJSON(key) {
    const raw = this.storage.get(key);
    if (raw == null) return { ok: true, value: null };
    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch {
      // Datos dañados: se guarda una copia y se empieza de nuevo.
      this.storage.set(`${key}_corrupt`, raw);
      return { ok: false, value: null };
    }
  }

  readProgress() {
    const { value } = this.readJSON(SAVE_KEY);
    return sanitizeProgress(value);
  }

  readSettings() {
    const { value } = this.readJSON(SETTINGS_KEY);
    return sanitizeSettings(value);
  }

  saveProgress() {
    this.storage.set(SAVE_KEY, JSON.stringify(this.progress));
    this.emit('progress');
  }

  saveSettings() {
    this.storage.set(SETTINGS_KEY, JSON.stringify(this.settings));
    this.emit('settings');
  }

  updateSettings(patch) {
    this.settings = sanitizeSettings({ ...this.settings, ...patch });
    this.saveSettings();
  }

  hasProgress() {
    const p = this.progress;
    return p.started && (p.completedMissions.length > 0 || p.unlockedLevel > 1 || Object.keys(p.checkpoints).length > 0 || p.flags.introSeen === true);
  }

  newGame(avatar) {
    const fresh = defaultProgress();
    fresh.started = true;
    if (avatar) fresh.avatar = sanitizeProgress({ avatar }).avatar;
    this.progress = fresh;
    this.saveProgress();
  }

  resetProgress() {
    this.progress = defaultProgress();
    this.storage.remove(SAVE_KEY);
    this.emit('progress');
  }

  setFlag(name, value = true) {
    this.progress.flags[name] = value;
    this.saveProgress();
  }

  getFlag(name) {
    return this.progress.flags[name] === true;
  }

  setCheckpoint(level, index) {
    this.progress.checkpoints[level] = index;
    this.saveProgress();
  }

  getCheckpoint(level) {
    return this.progress.checkpoints[level] ?? 0;
  }

  completeLevel(level) {
    const p = this.progress;
    if (!p.levelsCompleted.includes(level)) p.levelsCompleted.push(level);
    p.unlockedLevel = Math.min(MAX_LEVEL, Math.max(p.unlockedLevel, level + 1));
    p.currentLevel = Math.min(MAX_LEVEL, level + 1);
    this.saveProgress();
  }

  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit(type) { this.listeners.forEach((fn) => fn(type)); }
}

export const save = new SaveManager();
