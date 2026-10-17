import Phaser from 'phaser';
import missionsData from '../data/missions.json';
import { save } from './SaveManager.js';

// Estado de las nueve misiones y objetivo actual que muestra el HUD.

class QuestManager extends Phaser.Events.EventEmitter {
  constructor() {
    super();
    this.objective = null;
  }

  get all() { return missionsData.missions; }
  get(id) { return this.all.find((m) => m.id === id); }
  content(id) { return missionsData[id]; }
  forLevel(level) { return this.all.filter((m) => m.level === level); }

  isComplete(id) { return save.progress.completedMissions.includes(id); }

  complete(id) {
    if (this.isComplete(id)) return false;
    save.progress.completedMissions.push(id);
    save.saveProgress();
    this.emit('complete', id);
    return true;
  }

  levelProgress(level) {
    const list = this.forLevel(level);
    return { done: list.filter((m) => this.isComplete(m.id)).length, total: list.length };
  }

  // objective: { text, hint } — lo define cada nivel según su estado.
  setObjective(objective) {
    this.objective = objective;
    this.emit('objective', objective);
  }
}

export const quests = new QuestManager();
