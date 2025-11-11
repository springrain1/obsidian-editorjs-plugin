declare module 'editorjs-undo' {
  import EditorJS from '@editorjs/editorjs';

  interface UndoConfig {
    editor: EditorJS;
    maxLength?: number;
    onUpdate?: () => void;
  }

  class Undo {
    constructor(config: UndoConfig);
    initialize(data: any): void;
    undo(): void;
    redo(): void;
    destroy(): void;
    clear(): void;
  }

  export default Undo;
}
