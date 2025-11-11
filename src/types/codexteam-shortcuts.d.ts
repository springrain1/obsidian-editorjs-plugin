declare module '@codexteam/shortcuts' {
  interface ShortcutConfig {
    name: string;
    handler: (event: KeyboardEvent) => void;
    on: HTMLElement;
  }

  class Shortcut {
    constructor(config: ShortcutConfig);
    remove(): void;
  }

  export default Shortcut;
}
