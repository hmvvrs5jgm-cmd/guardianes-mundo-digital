import Phaser from 'phaser';
import rewards from '../data/rewards.json';
import { save } from './SaveManager.js';

// Herramientas, cristales e insignias del jugador. Persistente vía SaveManager.

class InventoryManager extends Phaser.Events.EventEmitter {
  get progress() { return save.progress; }

  has(itemId) { return this.progress.inventory.includes(itemId); }
  hasBadge(id) { return this.progress.badges.includes(id); }
  hasCrystal(id) { return this.progress.crystals.includes(id); }

  addItem(id) { return this.add('inventory', id, rewards.items); }
  addBadge(id) { return this.add('badges', id, rewards.badges); }
  addCrystal(id) { return this.add('crystals', id, rewards.crystals); }

  add(list, id, catalog) {
    if (!catalog[id] || this.progress[list].includes(id)) return false;
    this.progress[list].push(id);
    save.saveProgress();
    this.emit('change', { list, id });
    return true;
  }

  item(id) { return rewards.items[id]; }
  badge(id) { return rewards.badges[id]; }
  crystal(id) { return rewards.crystals[id]; }

  // Busca la definición en cualquier catálogo.
  lookup(id) {
    if (rewards.items[id]) return { kind: 'item', ...rewards.items[id] };
    if (rewards.crystals[id]) return { kind: 'crystal', ...rewards.crystals[id] };
    if (rewards.badges[id]) return { kind: 'badge', ...rewards.badges[id] };
    return null;
  }

  allItems() { return Object.entries(rewards.items).map(([id, d]) => ({ id, ...d })); }
  allBadges() { return Object.entries(rewards.badges).map(([id, d]) => ({ id, ...d })); }
  allCrystals() { return Object.entries(rewards.crystals).map(([id, d]) => ({ id, ...d })); }
}

export const inventory = new InventoryManager();
