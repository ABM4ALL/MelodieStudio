import { registerOnSaveCommand, unregisterOnSaveCommand } from "../events/globalevents";
type HandlerTypes = { onSave: () => void }

export class EditorUtils {
  handlers: HandlerTypes
  constructor(handlers: HandlerTypes) {
    this.handlers = handlers
    this.connectHandlers()
  }
  connectHandlers() {
    registerOnSaveCommand(this.handlers.onSave);
  }
  disposeHandlers() {
    unregisterOnSaveCommand(this.handlers.onSave);
  }
}