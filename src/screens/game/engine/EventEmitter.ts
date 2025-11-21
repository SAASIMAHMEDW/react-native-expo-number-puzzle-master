import { GameEvent, EventCallback, IEventEmitter } from "./types";

// ============================================
// EVENT EMITTER - Observer Pattern
// ============================================

export class EventEmitter implements IEventEmitter {
  private events: Map<GameEvent, Set<EventCallback>>;

  private listeners: Map<GameEvent, Array<(data?: any) => void>>;
  private batchedEvents: Map<GameEvent, any[]>;
  private batchTimeout: NodeJS.Timeout | null;

  constructor() {
    this.events = new Map();
    this.listeners = new Map();
    this.batchedEvents = new Map();
    this.batchTimeout = null;
  }

  on(event: GameEvent, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  off(event: GameEvent, callback: EventCallback): void {
    if (this.events.has(event)) {
      this.events.get(event)!.delete(callback);
    }
  }

  emit(event: GameEvent, data?: any): void {
    if (this.events.has(event)) {
      this.events.get(event)!.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
  // Batch multiple rapid events
  emitBatched(event: GameEvent, data?: any): void {
    if (!this.batchedEvents.has(event)) {
      this.batchedEvents.set(event, []);
    }
    this.batchedEvents.get(event)!.push(data);

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.batchedEvents.forEach((dataArray, evt) => {
        this.emit(evt, dataArray[dataArray.length - 1]); // Use latest
      });
      this.batchedEvents.clear();
    }, 16); // ~60fps
  }

  removeAllListeners(event?: GameEvent): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}
