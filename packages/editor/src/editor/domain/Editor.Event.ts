import Editor from '../app';
import { Events } from '../type/events';

class EditorEvent {
  #Editor: Editor;
  constructor(editor: Editor) {
    this.#Editor = editor;
  }

  public init() {
    this.#initEvents();
  }

  public eventTrigger(type: keyof Events, params: Events[keyof Events]) {
    this.#Editor.trigger(type, params);
  }

  #initEvents() {
    const editor = this.#Editor;
    window.addEventListener('resize', () => {
      editor.trigger('resize', { type: 'resize', target: editor });
    });
  }
}

export default EditorEvent;
