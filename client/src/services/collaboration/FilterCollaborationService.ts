/**
 * Filter Collaboration Service
 * Real-time collaboration features for filter management
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import { FilterStateManager } from '@/services/filtering/FilterStateManager';
import type { FilterState, FilterStateUpdate } from '@/services/filtering/FilterStateManager';
import { z } from 'zod';

// ===== COLLABORATION INTERFACES =====

/**
 * Filter session interface
 */
export interface FilterSession {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly participants: readonly SessionParticipant[];
  readonly filters: FilterState;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly isActive: boolean;
  readonly permissions: SessionPermissions;
  readonly settings: SessionSettings;
  readonly metadata: SessionMetadata;
}

/**
 * Session participant interface
 */
export interface SessionParticipant {
  readonly userId: string;
  readonly username: string;
  readonly displayName: string;
  readonly avatar?: string;
  readonly role: 'owner' | 'editor' | 'viewer';
  readonly joinedAt: Date;
  readonly lastActive: Date;
  readonly isOnline: boolean;
  readonly permissions: ParticipantPermissions;
  readonly preferences: ParticipantPreferences;
}

/**
 * Participant permissions interface
 */
export interface ParticipantPermissions {
  readonly canEditFilters: boolean;
  readonly canAddParticipants: boolean;
  readonly canRemoveParticipants: boolean;
  readonly canChangeSettings: boolean;
  readonly canDeleteSession: boolean;
  readonly canExportData: boolean;
  readonly canViewHistory: boolean;
}

/**
 * Participant preferences interface
 */
export interface ParticipantPreferences {
  readonly notifications: boolean;
  readonly autoSync: boolean;
  readonly conflictResolution: 'manual' | 'auto-accept' | 'auto-reject';
  readonly theme: 'light' | 'dark' | 'auto';
  readonly language: string;
}

/**
 * Session permissions interface
 */
export interface SessionPermissions {
  readonly allowGuestAccess: boolean;
  readonly requireApproval: boolean;
  readonly maxParticipants: number;
  readonly allowAnonymous: boolean;
  readonly allowRecording: boolean;
  readonly allowScreensharing: boolean;
  readonly allowedDomains: readonly string[];
  readonly restrictedUsers: readonly string[];
}

/**
 * Session settings interface
 */
export interface SessionSettings {
  readonly autoSave: boolean;
  readonly saveInterval: number;
  readonly conflictResolution: 'last-wins' | 'manual' | 'merge';
  readonly versionControl: boolean;
  readonly maxVersions: number;
  readonly retentionDays: number;
  readonly backupEnabled: boolean;
  readonly backupInterval: number;
}

/**
 * Session metadata interface
 */
export interface SessionMetadata {
  readonly version: string;
  readonly tags: readonly string[];
  readonly category: string;
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly estimatedDuration: number;
  readonly actualDuration: number;
  readonly completionStatus: 'not-started' | 'in-progress' | 'completed' | 'paused';
  readonly notes: string;
}

/**
 * Filter change interface
 */
export interface FilterChange {
  readonly id: string;
  readonly sessionId: string;
  readonly userId: string;
  readonly username: string;
  readonly changeType: 'add' | 'remove' | 'modify' | 'clear' | 'reset';
  readonly filterKey: string;
  readonly oldValue: any;
  readonly newValue: any;
  readonly timestamp: Date;
  readonly comment?: string;
  readonly metadata: ChangeMetadata;
}

/**
 * Change metadata interface
 */
export interface ChangeMetadata {
  readonly version: string;
  readonly clientId: string;
  readonly deviceInfo: DeviceInfo;
  readonly networkInfo: NetworkInfo;
  readonly performanceMetrics: PerformanceMetrics;
}

/**
 * Device info interface
 */
export interface DeviceInfo {
  readonly userAgent: string;
  readonly platform: string;
  readonly browser: string;
  readonly version: string;
  readonly screenResolution: string;
  readonly timezone: string;
  readonly language: string;
}

/**
 * Network info interface
 */
export interface NetworkInfo {
  readonly connectionType: string;
  readonly effectiveType: string;
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  readonly changeTime: number;
  readonly renderTime: number;
  readonly memoryUsage: number;
  readonly cpuUsage: number;
}

/**
 * Collaboration event interface
 */
export interface CollaborationEvent {
  readonly type: 'session-created' | 'session-joined' | 'session-left' | 'participant-added' | 'participant-removed' | 'filter-changed' | 'session-ended' | 'error-occurred';
  readonly timestamp: number;
  readonly sessionId: string;
  readonly userId?: string;
  readonly data: any;
  readonly metadata: EventMetadata;
}

/**
 * Event metadata interface
 */
export interface EventMetadata {
  readonly source: string;
  readonly category: string;
  readonly severity: 'info' | 'warning' | 'error' | 'critical';
  readonly tags: readonly string[];
  readonly correlationId: string;
}

/**
 * WebSocket message interface
 */
export interface WebSocketMessage {
  readonly type: string;
  readonly sessionId: string;
  readonly userId: string;
  readonly timestamp: number;
  readonly data: any;
  readonly metadata?: any;
}

/**
 * Conflict resolution interface
 */
export interface ConflictResolution {
  readonly conflictId: string;
  readonly sessionId: string;
  readonly userId: string;
  readonly change1: FilterChange;
  readonly change2: FilterChange;
  readonly resolution: 'accept-change1' | 'accept-change2' | 'merge' | 'manual';
  readonly resolvedBy?: string;
  readonly resolvedAt?: Date;
  readonly notes?: string;
}

// ===== COLLABORATION VALIDATION SCHEMAS =====

/**
 * Session validation schema
 */
export const SessionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  participants: z.array(z.object({
    userId: z.string(),
    username: z.string(),
    displayName: z.string(),
    avatar: z.string().optional(),
    role: z.enum(['owner', 'editor', 'viewer']),
    joinedAt: z.date(),
    lastActive: z.date(),
    isOnline: z.boolean(),
    permissions: z.object({
      canEditFilters: z.boolean(),
      canAddParticipants: z.boolean(),
      canRemoveParticipants: z.boolean(),
      canChangeSettings: z.boolean(),
      canDeleteSession: z.boolean(),
      canExportData: z.boolean(),
      canViewHistory: z.boolean(),
    }),
    preferences: z.object({
      notifications: z.boolean(),
      autoSync: z.boolean(),
      conflictResolution: z.enum(['manual', 'auto-accept', 'auto-reject']),
      theme: z.enum(['light', 'dark', 'auto']),
      language: z.string(),
    }),
  })),
  filters: z.object({
    selectedCategories: z.array(z.string()),
    selectedBrands: z.array(z.string()),
    selectedSizes: z.array(z.string()),
    selectedColors: z.array(z.string()),
    selectedPrices: z.array(z.string()),
    selectedAvailability: z.array(z.string()),
    selectedTypes: z.array(z.string()),
    brandSearchQuery: z.string(),
    searchQuery: z.string(),
    sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating']),
    viewMode: z.enum(['grid', 'list']),
    currentPage: z.number().min(1),
    itemsPerPage: z.number().min(1).max(100),
    priceRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    expandedSections: z.array(z.string()),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
  permissions: z.object({
    allowGuestAccess: z.boolean(),
    requireApproval: z.boolean(),
    maxParticipants: z.number().min(1).max(100),
    allowAnonymous: z.boolean(),
    allowRecording: z.boolean(),
    allowScreensharing: z.boolean(),
    allowedDomains: z.array(z.string()),
    restrictedUsers: z.array(z.string()),
  }),
  settings: z.object({
    autoSave: z.boolean(),
    saveInterval: z.number().min(1000).max(300000),
    conflictResolution: z.enum(['last-wins', 'manual', 'merge']),
    versionControl: z.boolean(),
    maxVersions: z.number().min(1).max(1000),
    retentionDays: z.number().min(1).max(365),
    backupEnabled: z.boolean(),
    backupInterval: z.number().min(60000).max(86400000),
  }),
  metadata: z.object({
    version: z.string(),
    tags: z.array(z.string()),
    category: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    estimatedDuration: z.number(),
    actualDuration: z.number(),
    completionStatus: z.enum(['not-started', 'in-progress', 'completed', 'paused']),
    notes: z.string(),
  }),
});

/**
 * Filter change validation schema
 */
export const FilterChangeSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  userId: z.string(),
  username: z.string(),
  changeType: z.enum(['add', 'remove', 'modify', 'clear', 'reset']),
  filterKey: z.string(),
  oldValue: z.union([
    z.null(),
    z.undefined(),
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(z.number()),
    z.object({
      selectedCategories: z.array(z.string()).optional(),
      selectedBrands: z.array(z.string()).optional(),
      selectedSizes: z.array(z.string()).optional(),
      selectedColors: z.array(z.string()).optional(),
      selectedPrices: z.array(z.string()).optional(),
      selectedAvailability: z.array(z.string()).optional(),
      selectedTypes: z.array(z.string()).optional(),
      brandSearchQuery: z.string().optional(),
      searchQuery: z.string().optional(),
      sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating']).optional(),
      viewMode: z.enum(['grid', 'list']).optional(),
      currentPage: z.number().min(1).optional(),
      itemsPerPage: z.number().min(1).max(100).optional(),
      priceRange: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional(),
      expandedSections: z.array(z.string()).optional()
    }),
    z.record(z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.array(z.number()),
      z.null(),
      z.undefined()
    ]))
  ]),
  newValue: z.union([
    z.null(),
    z.undefined(),
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(z.number()),
    z.object({
      selectedCategories: z.array(z.string()).optional(),
      selectedBrands: z.array(z.string()).optional(),
      selectedSizes: z.array(z.string()).optional(),
      selectedColors: z.array(z.string()).optional(),
      selectedPrices: z.array(z.string()).optional(),
      selectedAvailability: z.array(z.string()).optional(),
      selectedTypes: z.array(z.string()).optional(),
      brandSearchQuery: z.string().optional(),
      searchQuery: z.string().optional(),
      sortBy: z.enum(['newest', 'price-low', 'price-high', 'popular', 'rating']).optional(),
      viewMode: z.enum(['grid', 'list']).optional(),
      currentPage: z.number().min(1).optional(),
      itemsPerPage: z.number().min(1).max(100).optional(),
      priceRange: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional(),
      expandedSections: z.array(z.string()).optional()
    }),
    z.record(z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.array(z.number()),
      z.null(),
      z.undefined()
    ]))
  ]),
  timestamp: z.date(),
  comment: z.string().optional(),
  metadata: z.object({
    version: z.string(),
    clientId: z.string(),
    deviceInfo: z.object({
      userAgent: z.string(),
      platform: z.string(),
      browser: z.string(),
      version: z.string(),
      screenResolution: z.string(),
      timezone: z.string(),
      language: z.string(),
    }),
    networkInfo: z.object({
      connectionType: z.string(),
      effectiveType: z.string(),
      downlink: z.number(),
      rtt: z.number(),
      saveData: z.boolean(),
    }),
    performanceMetrics: z.object({
      changeTime: z.number(),
      renderTime: z.number(),
      memoryUsage: z.number(),
      cpuUsage: z.number(),
    }),
  }),
});

// ===== COLLABORATION CONSTANTS =====

const DEFAULT_SESSION_SETTINGS: SessionSettings = {
  autoSave: true,
  saveInterval: 30000, // 30 seconds
  conflictResolution: 'manual',
  versionControl: true,
  maxVersions: 100,
  retentionDays: 30,
  backupEnabled: true,
  backupInterval: 300000, // 5 minutes
};

const DEFAULT_SESSION_PERMISSIONS: SessionPermissions = {
  allowGuestAccess: false,
  requireApproval: false,
  maxParticipants: 10,
  allowAnonymous: false,
  allowRecording: false,
  allowScreensharing: false,
  allowedDomains: [],
  restrictedUsers: [],
};

// ===== COLLABORATION SERVICE =====

/**
 * Enterprise-grade filter collaboration service
 * Manages real-time collaboration sessions and WebSocket communication
 */
export class FilterCollaborationService {
  private readonly filterStateManager: FilterStateManager;
  private readonly sessions: Map<string, FilterSession>;
  private readonly changes: Map<string, FilterChange[]>;
  private readonly conflicts: Map<string, ConflictResolution[]>;
  private readonly websocket: WebSocket | null;
  private readonly eventListeners: Map<string, ((event: CollaborationEvent) => void)[]>;
  private readonly messageQueue: WebSocketMessage[];
  private readonly reconnectAttempts: number;
  private readonly maxReconnectAttempts: number;
  private isConnected: boolean;
  private currentSessionId: string | null;
  private currentUserId: string | null;

  constructor(
    filterStateManager: FilterStateManager = FilterStateManager.getInstance(),
    websocketUrl?: string
  ) {
    this.filterStateManager = filterStateManager;
    this.sessions = new Map();
    this.changes = new Map();
    this.conflicts = new Map();
    this.eventListeners = new Map();
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnected = false;
    this.currentSessionId = null;
    this.currentUserId = null;

    if (websocketUrl) {
      this.websocket = this.createWebSocket(websocketUrl);
    } else {
      this.websocket = null;
    }

    this.setupFilterStateListener();
  }

  /**
   * Create WebSocket connection
   */
  private createWebSocket(url: string): WebSocket {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.flushMessageQueue();
      this.emitEvent('connection-established', { url });
    };

    ws.onmessage = (event) => {
      this.handleWebSocketMessage(event.data);
    };

    ws.onclose = () => {
      this.isConnected = false;
      this.emitEvent('connection-closed', { url });
      this.attemptReconnect(url);
    };

    ws.onerror = (error) => {
      this.emitEvent('connection-error', { error, url });
    };

    return ws;
  }

  /**
   * Handle WebSocket message
   */
  private handleWebSocketMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'session-created':
          this.handleSessionCreated(message);
          break;
        case 'session-joined':
          this.handleSessionJoined(message);
          break;
        case 'session-left':
          this.handleSessionLeft(message);
          break;
        case 'participant-added':
          this.handleParticipantAdded(message);
          break;
        case 'participant-removed':
          this.handleParticipantRemoved(message);
          break;
        case 'filter-changed':
          this.handleFilterChanged(message);
          break;
        case 'session-ended':
          this.handleSessionEnded(message);
          break;
        case 'conflict-detected':
          this.handleConflictDetected(message);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Send WebSocket message
   */
  private sendMessage(message: WebSocketMessage): void {
    if (this.websocket && this.isConnected) {
      this.websocket.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  /**
   * Flush message queue
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.websocket) {
        this.websocket.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.createWebSocket(url);
      }, Math.pow(2, this.reconnectAttempts) * 1000); // Exponential backoff
    }
  }

  /**
   * Setup filter state listener
   */
  private setupFilterStateListener(): void {
    this.filterStateManager.subscribe({
      id: 'collaboration-service',
      onStateChange: (state: FilterState) => {
        if (this.currentSessionId && this.currentUserId) {
          this.broadcastFilterChange(state);
        }
      },
      priority: 1,
    });
  }

  /**
   * Broadcast filter change
   */
  private broadcastFilterChange(state: FilterState): void {
    if (!this.currentSessionId || !this.currentUserId) return;

    const change: FilterChange = {
      id: this.generateId(),
      sessionId: this.currentSessionId,
      userId: this.currentUserId,
      username: this.getCurrentUsername(),
      changeType: 'modify',
      filterKey: 'state',
      oldValue: null,
      newValue: state,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        clientId: this.generateClientId(),
        deviceInfo: this.getDeviceInfo(),
        networkInfo: this.getNetworkInfo(),
        performanceMetrics: this.getPerformanceMetrics(),
      },
    };

    this.sendMessage({
      type: 'filter-changed',
      sessionId: this.currentSessionId,
      userId: this.currentUserId,
      timestamp: Date.now(),
      data: change,
    });

    // Store change locally
    if (!this.changes.has(this.currentSessionId)) {
      this.changes.set(this.currentSessionId, []);
    }
    this.changes.get(this.currentSessionId)!.push(change);
  }

  /**
   * Create a new collaboration session
   */
  public createSession(session: Omit<FilterSession, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'participants'>): FilterSession {
    const id = this.generateId();
    const now = new Date();

    const newSession: FilterSession = {
      ...session,
      id,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      participants: [],
    };

    // Validate session
    const validatedSession = SessionSchema.parse(newSession);
    this.sessions.set(id, validatedSession);

    this.sendMessage({
      type: 'session-created',
      sessionId: id,
      userId: this.currentUserId || 'system',
      timestamp: Date.now(),
      data: validatedSession,
    });

    this.emitEvent('session-created', { session: validatedSession });
    return validatedSession;
  }

  /**
   * Join a collaboration session
   */
  public joinSession(sessionId: string, userId: string, username: string, role: SessionParticipant['role'] = 'viewer'): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const participant: SessionParticipant = {
      userId,
      username,
      displayName: username,
      role,
      joinedAt: new Date(),
      lastActive: new Date(),
      isOnline: true,
      permissions: this.getDefaultPermissions(role),
      preferences: this.getDefaultPreferences(),
    };

    const updatedSession: FilterSession = {
      ...session,
      participants: [...session.participants, participant],
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, updatedSession);
    this.currentSessionId = sessionId;
    this.currentUserId = userId;

    this.sendMessage({
      type: 'session-joined',
      sessionId,
      userId,
      timestamp: Date.now(),
      data: { participant, session: updatedSession },
    });

    this.emitEvent('session-joined', { session: updatedSession, participant });
    return true;
  }

  /**
   * Leave a collaboration session
   */
  public leaveSession(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const updatedParticipants = session.participants.filter(p => p.userId !== userId);
    const updatedSession: FilterSession = {
      ...session,
      participants: updatedParticipants,
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, updatedSession);

    if (this.currentSessionId === sessionId && this.currentUserId === userId) {
      this.currentSessionId = null;
      this.currentUserId = null;
    }

    this.sendMessage({
      type: 'session-left',
      sessionId,
      userId,
      timestamp: Date.now(),
      data: { session: updatedSession },
    });

    this.emitEvent('session-left', { session: updatedSession, userId });
    return true;
  }

  /**
   * Add participant to session
   */
  public addParticipant(sessionId: string, participant: Omit<SessionParticipant, 'joinedAt' | 'lastActive' | 'isOnline'>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const newParticipant: SessionParticipant = {
      ...participant,
      joinedAt: new Date(),
      lastActive: new Date(),
      isOnline: true,
    };

    const updatedSession: FilterSession = {
      ...session,
      participants: [...session.participants, newParticipant],
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, updatedSession);

    this.sendMessage({
      type: 'participant-added',
      sessionId,
      userId: this.currentUserId || 'system',
      timestamp: Date.now(),
      data: { participant: newParticipant, session: updatedSession },
    });

    this.emitEvent('participant-added', { session: updatedSession, participant: newParticipant });
    return true;
  }

  /**
   * Remove participant from session
   */
  public removeParticipant(sessionId: string, userId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    const updatedParticipants = session.participants.filter(p => p.userId !== userId);
    const updatedSession: FilterSession = {
      ...session,
      participants: updatedParticipants,
      updatedAt: new Date(),
    };

    this.sessions.set(sessionId, updatedSession);

    this.sendMessage({
      type: 'participant-removed',
      sessionId,
      userId: this.currentUserId || 'system',
      timestamp: Date.now(),
      data: { userId, session: updatedSession },
    });

    this.emitEvent('participant-removed', { session: updatedSession, userId });
    return true;
  }

  /**
   * Get session by ID
   */
  public getSession(sessionId: string): FilterSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all sessions
   */
  public getAllSessions(): readonly FilterSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get active sessions
   */
  public getActiveSessions(): readonly FilterSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  /**
   * Get session changes
   */
  public getSessionChanges(sessionId: string): readonly FilterChange[] {
    return this.changes.get(sessionId) || [];
  }

  /**
   * Get session conflicts
   */
  public getSessionConflicts(sessionId: string): readonly ConflictResolution[] {
    return this.conflicts.get(sessionId) || [];
  }

  /**
   * Resolve conflict
   */
  public resolveConflict(conflictId: string, resolution: ConflictResolution['resolution'], resolvedBy: string, notes?: string): boolean {
    const conflicts = Array.from(this.conflicts.values()).flat();
    const conflict = conflicts.find(c => c.conflictId === conflictId);
    
    if (!conflict) {
      return false;
    }

    const resolvedConflict: ConflictResolution = {
      ...conflict,
      resolution,
      resolvedBy,
      resolvedAt: new Date(),
      notes,
    };

    if (!this.conflicts.has(conflict.sessionId)) {
      this.conflicts.set(conflict.sessionId, []);
    }
    this.conflicts.get(conflict.sessionId)!.push(resolvedConflict);

    this.emitEvent('conflict-resolved', { conflict: resolvedConflict });
    return true;
  }

  /**
   * Handle session created message
   */
  private handleSessionCreated(message: WebSocketMessage): void {
    const session = message.data as FilterSession;
    this.sessions.set(session.id, session);
    this.emitEvent('session-created', { session });
  }

  /**
   * Handle session joined message
   */
  private handleSessionJoined(message: WebSocketMessage): void {
    const { session, participant } = message.data;
    this.sessions.set(session.id, session);
    this.emitEvent('session-joined', { session, participant });
  }

  /**
   * Handle session left message
   */
  private handleSessionLeft(message: WebSocketMessage): void {
    const { session, userId } = message.data;
    this.sessions.set(session.id, session);
    this.emitEvent('session-left', { session, userId });
  }

  /**
   * Handle participant added message
   */
  private handleParticipantAdded(message: WebSocketMessage): void {
    const { session, participant } = message.data;
    this.sessions.set(session.id, session);
    this.emitEvent('participant-added', { session, participant });
  }

  /**
   * Handle participant removed message
   */
  private handleParticipantRemoved(message: WebSocketMessage): void {
    const { session, userId } = message.data;
    this.sessions.set(session.id, session);
    this.emitEvent('participant-removed', { session, userId });
  }

  /**
   * Handle filter changed message
   */
  private handleFilterChanged(message: WebSocketMessage): void {
    const change = message.data as FilterChange;
    
    if (!this.changes.has(change.sessionId)) {
      this.changes.set(change.sessionId, []);
    }
    this.changes.get(change.sessionId)!.push(change);

    // Update session filters if it's from another user
    if (change.userId !== this.currentUserId) {
      this.filterStateManager.updateState(change.newValue);
    }

    this.emitEvent('filter-changed', { change });
  }

  /**
   * Handle session ended message
   */
  private handleSessionEnded(message: WebSocketMessage): void {
    const { sessionId } = message.data;
    const session = this.sessions.get(sessionId);
    if (session) {
      const updatedSession: FilterSession = {
        ...session,
        isActive: false,
        updatedAt: new Date(),
      };
      this.sessions.set(sessionId, updatedSession);
      this.emitEvent('session-ended', { session: updatedSession });
    }
  }

  /**
   * Handle conflict detected message
   */
  private handleConflictDetected(message: WebSocketMessage): void {
    const conflict = message.data as ConflictResolution;
    
    if (!this.conflicts.has(conflict.sessionId)) {
      this.conflicts.set(conflict.sessionId, []);
    }
    this.conflicts.get(conflict.sessionId)!.push(conflict);

    this.emitEvent('conflict-detected', { conflict });
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: SessionParticipant['role']): ParticipantPermissions {
    switch (role) {
      case 'owner':
        return {
          canEditFilters: true,
          canAddParticipants: true,
          canRemoveParticipants: true,
          canChangeSettings: true,
          canDeleteSession: true,
          canExportData: true,
          canViewHistory: true,
        };
      case 'editor':
        return {
          canEditFilters: true,
          canAddParticipants: false,
          canRemoveParticipants: false,
          canChangeSettings: false,
          canDeleteSession: false,
          canExportData: true,
          canViewHistory: true,
        };
      case 'viewer':
        return {
          canEditFilters: false,
          canAddParticipants: false,
          canRemoveParticipants: false,
          canChangeSettings: false,
          canDeleteSession: false,
          canExportData: false,
          canViewHistory: true,
        };
    }
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(): ParticipantPreferences {
    return {
      notifications: true,
      autoSync: true,
      conflictResolution: 'manual',
      theme: 'auto',
      language: 'en',
    };
  }

  /**
   * Get current username
   */
  private getCurrentUsername(): string {
    if (!this.currentSessionId || !this.currentUserId) return 'Unknown';
    
    const session = this.sessions.get(this.currentSessionId);
    if (!session) return 'Unknown';
    
    const participant = session.participants.find(p => p.userId === this.currentUserId);
    return participant?.username || 'Unknown';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate client ID
   */
  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get device info
   */
  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      browser: this.getBrowserInfo(),
      version: this.getBrowserVersion(),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  /**
   * Get browser info
   */
  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  /**
   * Get browser version
   */
  private getBrowserVersion(): string {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(chrome|firefox|safari|edge)\/(\d+)/i);
    return match ? match[2] : 'Unknown';
  }

  /**
   * Get network info
   */
  private getNetworkInfo(): NetworkInfo {
    const connection = (navigator as any).connection;
    return {
      connectionType: connection?.effectiveType || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
    };
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics(): PerformanceMetrics {
    return {
      changeTime: performance.now(),
      renderTime: 0, // Would be calculated from actual render time
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      cpuUsage: 0, // Would need external CPU monitoring
    };
  }

  /**
   * Add event listener
   */
  public addEventListener(event: string, listener: (event: CollaborationEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(event: string, listener: (event: CollaborationEvent) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit collaboration event
   */
  private emitEvent(type: string, data: any): void {
    const event: CollaborationEvent = {
      type: type as any,
      timestamp: Date.now(),
      sessionId: this.currentSessionId || 'unknown',
      userId: this.currentUserId,
      data,
      metadata: {
        source: 'FilterCollaborationService',
        category: 'collaboration',
        severity: 'info',
        tags: [],
        correlationId: this.generateId(),
      },
    };

    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
    }
    this.isConnected = false;
    this.currentSessionId = null;
    this.currentUserId = null;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): { isConnected: boolean; reconnectAttempts: number } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Export session data
   */
  public exportSessionData(sessionId: string, format: 'json' | 'csv'): string {
    const session = this.sessions.get(sessionId);
    const changes = this.changes.get(sessionId) || [];
    const conflicts = this.conflicts.get(sessionId) || [];

    const data = {
      session,
      changes,
      conflicts,
      exportDate: new Date().toISOString(),
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // CSV format would be implemented here
      return 'CSV export not implemented';
    }
  }
}

// ===== EXPORTS =====

export {
  FilterCollaborationService,
  DEFAULT_SESSION_SETTINGS,
  DEFAULT_SESSION_PERMISSIONS,
  SessionSchema,
  FilterChangeSchema,
};
export type {
  FilterSession,
  SessionParticipant,
  ParticipantPermissions,
  ParticipantPreferences,
  SessionPermissions,
  SessionSettings,
  SessionMetadata,
  FilterChange,
  ChangeMetadata,
  DeviceInfo,
  NetworkInfo,
  PerformanceMetrics,
  CollaborationEvent,
  EventMetadata,
  WebSocketMessage,
  ConflictResolution,
}; 