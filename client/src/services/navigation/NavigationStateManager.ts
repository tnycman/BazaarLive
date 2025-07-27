/**
 * Navigation State Manager - Enterprise State Management
 * Implements Command Pattern with Undo/Redo capabilities
 */

export interface NavigationState {
  activeDropdown: string | null;
  previousDropdown: string | null;
  hoveredCategory: string | null;
  isTransitioning: boolean;
  stateHistory: NavigationState[];
  currentHistoryIndex: number;
}

export interface INavigationCommand {
  execute(): void;
  undo(): void;
  canExecute(): boolean;
}

/**
 * Command to show dropdown
 */
export class ShowDropdownCommand implements INavigationCommand {
  constructor(
    private stateManager: NavigationStateManager,
    private category: string
  ) {}

  execute(): void {
    this.stateManager.setState(prevState => ({
      ...prevState,
      previousDropdown: prevState.activeDropdown,
      activeDropdown: this.category,
      hoveredCategory: this.category,
      isTransitioning: true
    }));

    // Simulate transition completion
    setTimeout(() => {
      this.stateManager.setState(prevState => ({
        ...prevState,
        isTransitioning: false
      }));
    }, 150);
  }

  undo(): void {
    this.stateManager.setState(prevState => ({
      ...prevState,
      activeDropdown: prevState.previousDropdown,
      previousDropdown: null,
      hoveredCategory: null,
      isTransitioning: false
    }));
  }

  canExecute(): boolean {
    return this.category !== null && this.category.trim().length > 0;
  }
}

/**
 * Command to hide dropdown
 */
export class HideDropdownCommand implements INavigationCommand {
  constructor(private stateManager: NavigationStateManager) {}

  execute(): void {
    this.stateManager.setState(prevState => ({
      ...prevState,
      previousDropdown: prevState.activeDropdown,
      activeDropdown: null,
      hoveredCategory: null,
      isTransitioning: true
    }));

    setTimeout(() => {
      this.stateManager.setState(prevState => ({
        ...prevState,
        isTransitioning: false
      }));
    }, 150);
  }

  undo(): void {
    this.stateManager.setState(prevState => ({
      ...prevState,
      activeDropdown: prevState.previousDropdown,
      previousDropdown: null,
      isTransitioning: false
    }));
  }

  canExecute(): boolean {
    return true;
  }
}

/**
 * Navigation State Manager with Command Pattern
 */
export class NavigationStateManager {
  private state: NavigationState;
  private listeners: Set<(state: NavigationState) => void> = new Set();
  private commandHistory: INavigationCommand[] = [];
  private currentCommandIndex = -1;
  private readonly maxHistorySize = 50;

  constructor() {
    this.state = {
      activeDropdown: null,
      previousDropdown: null,
      hoveredCategory: null,
      isTransitioning: false,
      stateHistory: [],
      currentHistoryIndex: -1
    };
  }

  /**
   * Get current state (immutable)
   */
  getState(): Readonly<NavigationState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Update state with functional approach
   */
  setState(updater: (prevState: NavigationState) => NavigationState): void {
    const newState = updater(this.state);
    
    // Validate state transition
    if (!this.isValidStateTransition(this.state, newState)) {
      console.error('[NavigationStateManager] Invalid state transition:', {
        from: this.state,
        to: newState
      });
      return;
    }

    // Update history
    newState.stateHistory = [...this.state.stateHistory.slice(-this.maxHistorySize), this.state];
    newState.currentHistoryIndex = newState.stateHistory.length - 1;

    this.state = newState;
    this.notifyListeners();
  }

  /**
   * Execute command with history tracking
   */
  executeCommand(command: INavigationCommand): boolean {
    if (!command.canExecute()) {
      console.warn('[NavigationStateManager] Command cannot be executed:', command);
      return false;
    }

    try {
      command.execute();
      
      // Add to command history
      this.commandHistory = this.commandHistory.slice(0, this.currentCommandIndex + 1);
      this.commandHistory.push(command);
      this.currentCommandIndex++;

      // Limit history size
      if (this.commandHistory.length > this.maxHistorySize) {
        this.commandHistory.shift();
        this.currentCommandIndex--;
      }

      return true;
    } catch (error) {
      console.error('[NavigationStateManager] Command execution failed:', error);
      return false;
    }
  }

  /**
   * Undo last command
   */
  undo(): boolean {
    if (this.currentCommandIndex < 0) {
      return false;
    }

    try {
      const command = this.commandHistory[this.currentCommandIndex];
      command.undo();
      this.currentCommandIndex--;
      return true;
    } catch (error) {
      console.error('[NavigationStateManager] Undo failed:', error);
      return false;
    }
  }

  /**
   * Redo next command
   */
  redo(): boolean {
    if (this.currentCommandIndex >= this.commandHistory.length - 1) {
      return false;
    }

    try {
      this.currentCommandIndex++;
      const command = this.commandHistory[this.currentCommandIndex];
      command.execute();
      return true;
    } catch (error) {
      console.error('[NavigationStateManager] Redo failed:', error);
      this.currentCommandIndex--;
      return false;
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: NavigationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Validate state transitions
   */
  private isValidStateTransition(oldState: NavigationState, newState: NavigationState): boolean {
    // Cannot have dropdown active and null simultaneously
    if (newState.activeDropdown && newState.activeDropdown === '') {
      return false;
    }

    // Cannot be transitioning without a state change
    if (newState.isTransitioning && 
        newState.activeDropdown === oldState.activeDropdown &&
        newState.hoveredCategory === oldState.hoveredCategory) {
      return false;
    }

    return true;
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    const frozenState = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(frozenState);
      } catch (error) {
        console.error('[NavigationStateManager] Listener error:', error);
      }
    });
  }

  /**
   * Reset state to initial
   */
  reset(): void {
    this.state = {
      activeDropdown: null,
      previousDropdown: null,
      hoveredCategory: null,
      isTransitioning: false,
      stateHistory: [],
      currentHistoryIndex: -1
    };
    this.commandHistory = [];
    this.currentCommandIndex = -1;
    this.notifyListeners();
  }

  /**
   * Get navigation metrics
   */
  getMetrics(): {
    commandHistorySize: number;
    stateHistorySize: number;
    listenerCount: number;
    canUndo: boolean;
    canRedo: boolean;
  } {
    return {
      commandHistorySize: this.commandHistory.length,
      stateHistorySize: this.state.stateHistory.length,
      listenerCount: this.listeners.size,
      canUndo: this.currentCommandIndex >= 0,
      canRedo: this.currentCommandIndex < this.commandHistory.length - 1
    };
  }
}

export const navigationStateManager = new NavigationStateManager();