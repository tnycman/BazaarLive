# Task 3: Draft Functionality System

## **📋 Overview**
Implement comprehensive draft system with auto-save, recovery, and draft management for listings, following enterprise-grade data persistence and user experience patterns.

## **🎯 Objectives**
- Auto-save form data to prevent data loss
- Provide draft management interface for users
- Implement draft recovery after browser crashes or navigation
- Support multiple draft versions and conflict resolution
- Ensure data consistency between drafts and published listings
- Enable collaborative editing features for future expansion

## **🏗️ Architecture Design**

### **Component Structure**
```
client/src/components/drafts/
├── DraftManager.tsx             # Main draft management interface
├── DraftsList.tsx               # User's draft listings
├── DraftCard.tsx                # Individual draft preview
├── DraftAutoSave.tsx            # Auto-save functionality
├── DraftRecovery.tsx            # Recovery dialog
├── DraftConflictResolver.tsx    # Conflict resolution
└── __tests__/                   # Comprehensive test suite
```

### **Service Layer**
```
client/src/services/drafts/
├── DraftStorageService.ts       # Local/remote storage
├── DraftSyncService.ts          # Synchronization logic
├── DraftVersioningService.ts    # Version management
├── DraftConflictService.ts      # Conflict detection
└── DraftCleanupService.ts       # Cleanup and maintenance
```

### **Backend Structure**
```
server/
├── models/
│   └── ListingDraft.ts          # Draft data models
├── services/
│   ├── DraftService.ts          # Draft business logic
│   ├── DraftSyncService.ts      # Real-time sync
│   └── DraftCleanupService.ts   # Automated cleanup
├── routes/
│   └── drafts.ts                # Draft API endpoints
└── migrations/
    └── add_drafts_table.sql     # Database schema
```

## **🔧 Technical Specifications**

### **Data Models**

#### **1. Draft Schema**
```typescript
// shared/types/Draft.ts
export interface ListingDraft {
  id: string;
  userId: string;
  title?: string;
  status: DraftStatus;
  formData: ListingFormData;
  dynamicFields: Record<string, any>;
  metadata: DraftMetadata;
  version: number;
  parentDraftId?: string; // For branching/forking
  createdAt: Date;
  updatedAt: Date;
  lastSavedAt: Date;
  expiresAt?: Date;
}

export type DraftStatus = 
  | 'active'      // Currently being edited
  | 'saved'       // Manually saved by user
  | 'auto_saved'  // Auto-saved by system
  | 'published'   // Converted to published listing
  | 'archived'    // User archived
  | 'expired';    // System expired

export interface DraftMetadata {
  deviceId: string;
  userAgent: string;
  sessionId: string;
  saveCount: number;
  wordCount: number;
  completionPercentage: number;
  lastEditedField: string;
  hasUnsavedChanges: boolean;
  autoSaveEnabled: boolean;
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
}

export interface ListingFormData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  size?: string;
  color?: string;
  condition: string;
  price: string;
  originalPrice?: string;
  images: string[];
  tags: string[];
  location?: string;
}
```

#### **2. Draft Conflict Resolution**
```typescript
// shared/types/DraftConflict.ts
export interface DraftConflict {
  id: string;
  draftId: string;
  conflictType: ConflictType;
  localVersion: ListingDraft;
  remoteVersion: ListingDraft;
  conflictedFields: string[];
  resolution?: ConflictResolution;
  createdAt: Date;
  resolvedAt?: Date;
}

export type ConflictType = 
  | 'version_mismatch'    // Version numbers don't match
  | 'concurrent_edit'     // Multiple users editing
  | 'device_sync'         // Different devices
  | 'session_timeout';    // Session expired during edit

export interface ConflictResolution {
  strategy: 'use_local' | 'use_remote' | 'merge_fields' | 'create_branch';
  mergedData?: ListingFormData;
  resolvedBy: string;
  notes?: string;
}
```

### **Auto-Save Implementation**

#### **1. Auto-Save Hook**
```typescript
// client/src/hooks/useAutoSave.ts
interface AutoSaveOptions {
  interval: number; // milliseconds
  enabled: boolean;
  onSave: (data: any) => Promise<void>;
  onError: (error: Error) => void;
  immediate?: boolean; // Save immediately on change
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions
) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<T>(data);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (dataToSave: T) => {
      try {
        setSaveStatus('saving');
        await options.onSave(dataToSave);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        setSaveStatus('error');
        options.onError(error as Error);
      }
    }, options.interval),
    [options.onSave, options.onError, options.interval]
  );

  // Effect to trigger save when data changes
  useEffect(() => {
    if (!options.enabled) return;
    
    // Check if data actually changed
    if (JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
      return;
    }
    
    lastDataRef.current = data;
    
    if (options.immediate) {
      debouncedSave(data);
    } else {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        debouncedSave(data);
      }, options.interval);
    }
  }, [data, options.enabled, options.immediate, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    lastSaved,
    forceSave: () => debouncedSave(data)
  };
}
```

#### **2. Draft Auto-Save Component**
```typescript
// client/src/components/drafts/DraftAutoSave.tsx
interface DraftAutoSaveProps {
  formData: ListingFormData;
  dynamicFields: Record<string, any>;
  draftId?: string;
  onDraftSaved: (draft: ListingDraft) => void;
  onError: (error: Error) => void;
}

export function DraftAutoSave({
  formData,
  dynamicFields,
  draftId,
  onDraftSaved,
  onError
}: DraftAutoSaveProps) {
  const { user } = useAuth();
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  const draftData = useMemo(() => ({
    formData,
    dynamicFields,
    metadata: {
      deviceId: getDeviceId(),
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
      lastEditedField: getLastEditedField(),
      hasUnsavedChanges: true,
      autoSaveEnabled,
      completionPercentage: calculateCompletionPercentage(formData)
    }
  }), [formData, dynamicFields, autoSaveEnabled]);

  const saveDraft = useCallback(async (data: typeof draftData) => {
    if (!user) throw new Error('User not authenticated');
    
    const draftPayload: Partial<ListingDraft> = {
      id: draftId,
      userId: user.id,
      title: data.formData.title || 'Untitled Draft',
      status: 'auto_saved',
      formData: data.formData,
      dynamicFields: data.dynamicFields,
      metadata: {
        ...data.metadata,
        saveCount: (draftId ? await getDraftSaveCount(draftId) : 0) + 1,
        wordCount: calculateWordCount(data.formData),
      },
      lastSavedAt: new Date()
    };

    const savedDraft = await DraftStorageService.saveDraft(draftPayload);
    onDraftSaved(savedDraft);
    
    return savedDraft;
  }, [user, draftId, onDraftSaved]);

  const { saveStatus, lastSaved, forceSave } = useAutoSave(draftData, {
    interval: 3000, // 3 seconds
    enabled: autoSaveEnabled && !!user,
    onSave: saveDraft,
    onError
  });

  return (
    <div className="draft-auto-save flex items-center space-x-2 text-sm text-gray-500">
      <div className="flex items-center space-x-1">
        {saveStatus === 'saving' && (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Saving...</span>
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <Check className="w-3 h-3 text-green-500" />
            <span>Saved {lastSaved && formatDistanceToNow(lastSaved)} ago</span>
          </>
        )}
        {saveStatus === 'error' && (
          <>
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span>Save failed</span>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={forceSave}
          disabled={saveStatus === 'saving'}
        >
          Save now
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
        >
          Auto-save: {autoSaveEnabled ? 'On' : 'Off'}
        </Button>
      </div>
    </div>
  );
}
```

### **Draft Management Interface**

#### **1. Draft Manager Component**
```typescript
// client/src/components/drafts/DraftManager.tsx
export function DraftManager() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<ListingDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);

  const { data: userDrafts, isLoading } = useQuery({
    queryKey: ['/api/drafts', user?.id],
    queryFn: () => DraftStorageService.getUserDrafts(user!.id),
    enabled: !!user
  });

  const deleteDraftsMutation = useMutation({
    mutationFn: async (draftIds: string[]) => {
      await Promise.all(draftIds.map(id => DraftStorageService.deleteDraft(id)));
    },
    onSuccess: () => {
      setSelectedDrafts([]);
      // Refetch drafts
    }
  });

  const archiveDraftsMutation = useMutation({
    mutationFn: async (draftIds: string[]) => {
      await Promise.all(draftIds.map(id => 
        DraftStorageService.updateDraftStatus(id, 'archived')
      ));
    },
    onSuccess: () => {
      setSelectedDrafts([]);
      // Refetch drafts
    }
  });

  const publishDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      const draft = userDrafts?.find(d => d.id === draftId);
      if (!draft) throw new Error('Draft not found');
      
      // Convert draft to listing
      const listing = await createListingFromDraft(draft);
      
      // Update draft status
      await DraftStorageService.updateDraftStatus(draftId, 'published');
      
      return listing;
    },
    onSuccess: () => {
      toast({
        title: "Draft published!",
        description: "Your listing is now live in the marketplace."
      });
    }
  });

  const handleBulkAction = async (action: 'delete' | 'archive') => {
    if (selectedDrafts.length === 0) return;
    
    if (action === 'delete') {
      const confirmed = await showConfirmDialog(
        'Delete Drafts',
        `Are you sure you want to delete ${selectedDrafts.length} draft(s)? This action cannot be undone.`
      );
      if (confirmed) {
        deleteDraftsMutation.mutate(selectedDrafts);
      }
    } else if (action === 'archive') {
      archiveDraftsMutation.mutate(selectedDrafts);
    }
  };

  return (
    <div className="draft-manager space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Drafts</h2>
          <p className="text-gray-600">
            {userDrafts?.length || 0} draft{userDrafts?.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {selectedDrafts.length > 0 && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleBulkAction('archive')}
              disabled={archiveDraftsMutation.isPending}
            >
              Archive ({selectedDrafts.length})
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleBulkAction('delete')}
              disabled={deleteDraftsMutation.isPending}
            >
              Delete ({selectedDrafts.length})
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : userDrafts && userDrafts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userDrafts.map(draft => (
            <DraftCard
              key={draft.id}
              draft={draft}
              selected={selectedDrafts.includes(draft.id)}
              onSelect={(selected) => {
                if (selected) {
                  setSelectedDrafts(prev => [...prev, draft.id]);
                } else {
                  setSelectedDrafts(prev => prev.filter(id => id !== draft.id));
                }
              }}
              onEdit={() => navigateToEdit(draft.id)}
              onPublish={() => publishDraftMutation.mutate(draft.id)}
              onDelete={() => deleteDraftsMutation.mutate([draft.id])}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No drafts yet"
          description="Start creating a new listing to see your drafts here."
          action={
            <Button onClick={() => navigate('/create-listing')}>
              Create New Listing
            </Button>
          }
        />
      )}
    </div>
  );
}
```

#### **2. Draft Card Component**
```typescript
// client/src/components/drafts/DraftCard.tsx
interface DraftCardProps {
  draft: ListingDraft;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: () => void;
  onPublish: () => void;
  onDelete: () => void;
}

export function DraftCard({
  draft,
  selected,
  onSelect,
  onEdit,
  onPublish,
  onDelete
}: DraftCardProps) {
  const isComplete = draft.metadata.completionPercentage >= 80;
  const hasImages = draft.formData.images.length > 0;
  
  return (
    <Card className={`draft-card cursor-pointer transition-all ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <h3 className="font-semibold line-clamp-1">
                {draft.title || 'Untitled Draft'}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatDistanceToNow(draft.updatedAt)} ago</span>
                <DraftStatusBadge status={draft.status} />
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Draft
              </DropdownMenuItem>
              {isComplete && (
                <DropdownMenuItem onClick={onPublish}>
                  <Send className="w-4 h-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {hasImages && (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={draft.formData.images[0]}
              alt="Draft preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {draft.formData.description || 'No description'}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold">
              {draft.formData.price ? `$${draft.formData.price}` : 'No price set'}
            </span>
            {draft.formData.category && (
              <span className="text-gray-500 ml-2">
                in {draft.formData.category}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Progress
              value={draft.metadata.completionPercentage}
              className="w-16 h-2"
            />
            <span className="text-xs text-gray-500">
              {Math.round(draft.metadata.completionPercentage)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## **🗄️ Database Schema**

### **Draft Table Structure**
```sql
-- Migration: Create drafts table
CREATE TABLE listing_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  form_data JSONB NOT NULL DEFAULT '{}',
  dynamic_fields JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  parent_draft_id UUID REFERENCES listing_drafts(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_saved_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  
  CONSTRAINT valid_status CHECK (status IN ('active', 'saved', 'auto_saved', 'published', 'archived', 'expired'))
);

-- Migration: Create draft conflicts table
CREATE TABLE draft_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES listing_drafts(id) ON DELETE CASCADE,
  conflict_type VARCHAR(50) NOT NULL,
  local_version JSONB NOT NULL,
  remote_version JSONB NOT NULL,
  conflicted_fields TEXT[] NOT NULL,
  resolution JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_drafts_user_id ON listing_drafts(user_id);
CREATE INDEX idx_drafts_status ON listing_drafts(status);
CREATE INDEX idx_drafts_updated_at ON listing_drafts(updated_at);
CREATE INDEX idx_drafts_expires_at ON listing_drafts(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_draft_conflicts_draft_id ON draft_conflicts(draft_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_draft_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_draft_timestamp_trigger
  BEFORE UPDATE ON listing_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_draft_timestamp();
```

## **🔄 Synchronization & Conflict Resolution**

### **Conflict Detection Service**
```typescript
// server/services/DraftConflictService.ts
export class DraftConflictService {
  constructor(private db: Database) {}

  async detectConflicts(
    draftId: string,
    incomingData: Partial<ListingDraft>
  ): Promise<DraftConflict | null> {
    // Get current draft from database
    const currentDraft = await this.getDraft(draftId);
    if (!currentDraft) return null;

    // Check for version mismatch
    if (incomingData.version && incomingData.version !== currentDraft.version) {
      return this.createConflict(draftId, 'version_mismatch', currentDraft, incomingData);
    }

    // Check for concurrent edits (last modified within threshold)
    const timeDiff = Date.now() - currentDraft.lastSavedAt.getTime();
    if (timeDiff < 5000) { // 5 seconds threshold
      return this.createConflict(draftId, 'concurrent_edit', currentDraft, incomingData);
    }

    return null;
  }

  async resolveConflict(
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<ListingDraft> {
    const conflict = await this.getConflict(conflictId);
    if (!conflict) throw new Error('Conflict not found');

    let mergedData: ListingDraft;

    switch (resolution.strategy) {
      case 'use_local':
        mergedData = conflict.localVersion;
        break;
      case 'use_remote':
        mergedData = conflict.remoteVersion;
        break;
      case 'merge_fields':
        mergedData = this.mergeFields(conflict.localVersion, conflict.remoteVersion, resolution.mergedData);
        break;
      case 'create_branch':
        mergedData = await this.createBranch(conflict.localVersion, conflict.remoteVersion);
        break;
      default:
        throw new Error('Invalid resolution strategy');
    }

    // Update conflict as resolved
    await this.updateConflictStatus(conflictId, resolution);

    // Save merged draft
    return await this.saveDraft(mergedData);
  }
}
```

## **🧹 Cleanup & Maintenance**

### **Automated Cleanup Service**
```typescript
// server/services/DraftCleanupService.ts
export class DraftCleanupService {
  constructor(private db: Database) {}

  // Run daily cleanup
  async performDailyCleanup(): Promise<void> {
    await Promise.all([
      this.cleanupExpiredDrafts(),
      this.cleanupOldAutoSaves(),
      this.cleanupOrphanedConflicts(),
      this.optimizeStorage()
    ]);
  }

  private async cleanupExpiredDrafts(): Promise<void> {
    // Delete drafts that have exceeded their expiration date
    const expiredDrafts = await this.db.query(`
      DELETE FROM listing_drafts 
      WHERE expires_at < NOW() 
      AND status = 'expired'
      RETURNING id
    `);
    
    console.log(`Cleaned up ${expiredDrafts.rowCount} expired drafts`);
  }

  private async cleanupOldAutoSaves(): Promise<void> {
    // Keep only the latest 5 auto-saves per user, delete older ones
    await this.db.query(`
      WITH ranked_drafts AS (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
        FROM listing_drafts 
        WHERE status = 'auto_saved'
      )
      DELETE FROM listing_drafts 
      WHERE id IN (
        SELECT id FROM ranked_drafts WHERE rn > 5
      )
    `);
  }

  private async cleanupOrphanedConflicts(): Promise<void> {
    // Remove conflicts for drafts that no longer exist
    await this.db.query(`
      DELETE FROM draft_conflicts 
      WHERE draft_id NOT IN (SELECT id FROM listing_drafts)
    `);
  }

  private async optimizeStorage(): Promise<void> {
    // Compress old draft data, remove unnecessary metadata
    await this.db.query(`
      UPDATE listing_drafts 
      SET metadata = metadata - 'userAgent' - 'deviceId'
      WHERE updated_at < NOW() - INTERVAL '30 days'
      AND status IN ('archived', 'published')
    `);
  }
}
```

## **✅ Definition of Done**

### **Functional Requirements**
- [ ] Auto-save functionality with configurable intervals
- [ ] Draft management interface with CRUD operations
- [ ] Draft recovery after browser crashes/navigation
- [ ] Conflict detection and resolution system
- [ ] Bulk operations (delete, archive multiple drafts)
- [ ] Draft versioning and branching support
- [ ] Offline capability with sync when online

### **Technical Requirements**
- [ ] Real-time synchronization across devices
- [ ] Optimistic updates with conflict resolution
- [ ] Database migrations for draft schema
- [ ] Automated cleanup and maintenance jobs
- [ ] Performance optimization for large numbers of drafts
- [ ] Comprehensive error handling and recovery

### **User Experience Requirements**
- [ ] Visual feedback for save status
- [ ] Progress indication for draft completion
- [ ] Intuitive conflict resolution interface
- [ ] Mobile-responsive draft management
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Keyboard navigation support

### **Quality Requirements**
- [ ] 95% test coverage for draft functionality
- [ ] Load testing for concurrent draft editing
- [ ] Data integrity verification
- [ ] Cross-browser compatibility testing
- [ ] Mobile device testing
- [ ] Performance benchmarking
