declare module 'editorjs-drag-drop' {
  import EditorJS from '@editorjs/editorjs';
  class DragDrop {
    constructor(editor: EditorJS);
  }
  export default DragDrop;
}

declare module 'editorjs-alert' {
  class Alert {
    static get toolbox(): any;
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
  export default Alert;
}

declare module 'editorjs-button' {
  class Button {
    static get toolbox(): any;
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
  export default Button;
}

declare module 'editorjs-tooltip' {
  class Tooltip {
    static get isInline(): boolean;
    constructor(config: any);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
  export default Tooltip;
}

declare module 'editorjs-style' {
  class StyleInlineTool {
    static get isInline(): boolean;
    static get sanitize(): any;
    static get title(): string;
    static prepare(): void;
    constructor(config: { api: any });
    get shortcut(): string;
    render(): HTMLElement;
    renderActions(): HTMLElement;
    surround(range: Range): void;
    checkState(): boolean;
    clear(): void;
  }
  export default StyleInlineTool;
}

declare module 'editorjs-text-alignment-blocktune' {
  class AlignmentTune {
    static get isTune(): boolean;
    constructor(config: any);
    render(): HTMLElement;
    wrap(blockContent: HTMLElement): HTMLElement;
    save(): any;
  }
  export default AlignmentTune;
}

declare module '@editorjs/personality' {
  class Personality {
    static get toolbox(): any;
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
  export default Personality;
}

declare module '@editorjs/nested-list' {
  class NestedList {
    static get toolbox(): any;
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
  export default NestedList;
}

declare module '@editorjs/footnotes' {
  class FootnotesTune {
    static get isTune(): boolean;
    static get sanitize(): any;
    constructor(config: {
      data?: any;
      api: any;
      config?: any;
    });
    render(): HTMLElement;
    save(): any;
    wrap(blockContent: HTMLElement): HTMLElement;
    destroy(): void;
  }
  export default FootnotesTune;
}

declare module 'editorjs-hyperlink' {
  class Hyperlink {
    static get isInline(): boolean;
    constructor(config: any);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
  export default Hyperlink;
}

declare module 'editorjs-toggle-block' {
  class ToggleBlock {
    static get toolbox(): any;
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
  export default ToggleBlock;
}

declare module 'editorjs-change-case' {
  class ChangeCase {
    static get isInline(): boolean;
    constructor(config: any);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
  export default ChangeCase;
}

declare module 'editorjs-strikethrough' {
  class Strikethrough {
    static get isInline(): boolean;
    constructor(config: any);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
  export default Strikethrough;
}

declare module 'editorjs-inline-spoiler-tool' {
  class Spoiler {
    static get isInline(): boolean;
    constructor(config: any);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
  export default Spoiler;
}

declare module '@editorjs/text-variant-tune' {
  class TextVariantTune {
    static get isTune(): boolean;
    constructor(config: any);
    render(): HTMLElement;
    wrap(blockContent: HTMLElement): HTMLElement;
    save(): any;
  }
  export default TextVariantTune;
}

declare module 'editorjs-text-color-plugin' {
  class ColorPlugin {
    static get isInline(): boolean;
    constructor(config: any);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
  }
  export default ColorPlugin;
}

declare module 'editorjs-math' {
  class MathTool {
    static get toolbox(): any;
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): any;
  }
  export default MathTool;
}

declare module 'editorjs-layout' {
  export class LayoutBlockTool {
    static get toolbox(): any;
    static get isReadOnlySupported(): boolean;
    static get shortcut(): string;
    constructor(config: {
      config?: {
        EditorJS: any;
        editorJSConfig?: any;
        enableLayoutEditing?: boolean;
        enableLayoutSaving?: boolean;
        initialData?: {
          itemContent: any;
          layout: any;
        };
      };
      data?: any;
      readOnly?: boolean;
    });
    render(): HTMLElement;
    save(): any;
    validate(data: any): boolean;
  }
  
  const EditorJSLayout: {
    LayoutBlockTool: typeof LayoutBlockTool;
  };
  
  export default EditorJSLayout;
}
