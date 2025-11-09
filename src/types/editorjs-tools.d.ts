/**
 * Type declarations for Editor.js tools without official TypeScript support
 */

declare module '@editorjs/checklist' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  
  export default class Checklist implements BlockToolConstructable {
    static get toolbox(): { title: string; icon: string };
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): { items: Array<{ text: string; checked: boolean }> };
    static get isReadOnlySupported(): boolean;
  }
}

declare module '@editorjs/marker' {
  import { InlineTool, InlineToolConstructable } from '@editorjs/editorjs';
  
  export default class Marker implements InlineToolConstructable {
    static get isInline(): boolean;
    static get sanitize(): any;
    constructor(config: any);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
    static get shortcut(): string;
  }
}

declare module '@editorjs/underline' {
  import { InlineTool, InlineToolConstructable } from '@editorjs/editorjs';
  
  export default class Underline implements InlineToolConstructable {
    static get isInline(): boolean;
    static get sanitize(): any;
    constructor(config: any);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
    static get shortcut(): string;
  }
}

declare module '@editorjs/inline-code' {
  import { InlineTool, InlineToolConstructable } from '@editorjs/editorjs';
  
  export default class InlineCode implements InlineToolConstructable {
    static get isInline(): boolean;
    static get sanitize(): any;
    constructor(config: any);
    render(): HTMLElement;
    surround(range: Range): void;
    checkState(selection: Selection): boolean;
    static get shortcut(): string;
  }
}
