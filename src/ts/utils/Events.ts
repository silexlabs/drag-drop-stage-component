
/**
 * add an event listener and returns an a method to call to remove the listener
 */
export function addEvent(obj: EventTarget, type: string, listener: EventListener, options: any = {}): () => void {
  obj.addEventListener(type, listener, options);
  return () => obj.removeEventListener(type, listener, options);
}
