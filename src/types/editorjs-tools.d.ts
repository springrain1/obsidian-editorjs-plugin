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

declare module '@editorjs/delimiter' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  
  export default class Delimiter implements BlockToolConstructable {
    static get toolbox(): { title: string; icon: string };
    constructor(config: any);
    render(): HTMLElement;
    save(): {};
  }
}

declare module '@editorjs/warning' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  
  export default class Warning implements BlockToolConstructable {
    static get toolbox(): { title: string; icon: string };
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): { title: string; message: string };
  }
}

declare module '@editorjs/raw' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  
  export default class RawTool implements BlockToolConstructable {
    static get toolbox(): { title: string; icon: string };
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): { html: string };
  }
}

declare module '@editorjs/embed' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  
  export default class Embed implements BlockToolConstructable {
    static get toolbox(): { title: string; icon: string };
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): { service: string; source: string; embed: string; width: number; height: number; caption: string };
  }
}

declare module '@editorjs/link' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  
  export default class LinkTool implements BlockToolConstructable {
    static get toolbox(): { title: string; icon: string };
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): { link: string; meta: any };
  }
}

declare module '@editorjs/attaches' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  
  export default class AttachesTool implements BlockToolConstructable {
    static get toolbox(): { title: string; icon: string };
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): { file: { url: string; size: number; name: string; extension: string }; title: string };
  }
}

declare module '@editorjs/simple-image' {
  import { BlockTool, BlockToolConstructable } from '@editorjs/editorjs';
  
  export default class SimpleImage implements BlockToolConstructable {
    static get toolbox(): { title: string; icon: string };
    constructor(config: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): { url: string; caption: string; withBorder: boolean; withBackground: boolean; stretched: boolean };
  }
}
