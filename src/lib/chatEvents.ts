// Event bus for chatbot-to-page real-time sync
type EventCallback = (data: any) => void;

class ChatEventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  on(event: string, cb: EventCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
    return () => this.listeners.get(event)?.delete(cb);
  }

  emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

export const chatEvents = new ChatEventBus();

// Table name to React Query key mapping
export const TABLE_QUERY_KEYS: Record<string, string[]> = {
  patients: ["patients"],
  beds: ["beds"],
  appointments: ["appointments"],
  orders: ["orders"],
  medications: ["medications"],
  staff: ["staff"],
  alerts: ["alerts"],
  bills: ["bills"],
};
