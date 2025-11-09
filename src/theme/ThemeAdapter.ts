import { App } from 'obsidian';

/**
 * Adapts Editor.js theme to match Obsidian's theme
 */
export class ThemeAdapter {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * Get current theme (light or dark)
   */
  getCurrentTheme(): 'light' | 'dark' {
    // Check if dark mode is enabled in Obsidian
    const isDark = document.body.classList.contains('theme-dark');
    return isDark ? 'dark' : 'light';
  }

  /**
   * Apply theme to container element
   */
  applyTheme(container: HTMLElement): void {
    const theme = this.getCurrentTheme();
    container.removeClass('theme-light', 'theme-dark');
    container.addClass(`theme-${theme}`);
  }

  /**
   * Watch for theme changes and call callback
   */
  watchThemeChanges(callback: (theme: 'light' | 'dark') => void): void {
    // Create a MutationObserver to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const theme = this.getCurrentTheme();
          callback(theme);
        }
      }
    });

    // Observe the body element for class changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
}
