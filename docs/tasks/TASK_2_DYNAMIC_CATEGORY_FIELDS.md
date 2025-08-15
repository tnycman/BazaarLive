# Task 2: Dynamic Category Fields System

## **📋 Overview**
Create category-specific form fields system with dynamic validation schemas and conditional rendering based on selected category, following enterprise architecture patterns.

## **🎯 Objectives**
- Implement dynamic form fields that change based on category selection
- Create extensible schema system for category-specific validations
- Build reusable field components for different data types
- Ensure type safety across all dynamic field configurations
- Maintain backward compatibility with existing listings

## **🏗️ Architecture Design**

### **Component Structure**
```
client/src/components/forms/
├── DynamicCategoryForm.tsx      # Main dynamic form orchestrator
├── fields/
│   ├── CategoryFieldRenderer.tsx # Field type renderer
│   ├── TextField.tsx            # Text input fields
│   ├── SelectField.tsx          # Dropdown selections
│   ├── NumberField.tsx          # Numeric inputs
│   ├── DateField.tsx            # Date/time pickers
│   ├── BooleanField.tsx         # Checkboxes/toggles
│   ├── MultiSelectField.tsx     # Multi-selection fields
│   └── CustomField.tsx          # Extensible custom fields
├── schemas/
│   ├── CategorySchemaManager.ts # Schema management
│   ├── FieldDefinitions.ts      # Field type definitions
│   └── ValidationRules.ts       # Validation logic
└── __tests__/                   # Comprehensive test suite
```

### **Backend Structure**
```
server/
├── models/
│   └── CategoryFieldDefinitions.ts # Database field definitions
├── services/
│   ├── CategoryConfigService.ts    # Category configuration
│   └── DynamicValidationService.ts # Runtime validation
├── routes/
│   └── categoryFields.ts           # Field configuration API
└── migrations/
    └── add_category_fields.sql     # Database schema updates
```

## **🔧 Technical Specifications**

### **Dynamic Field System**

#### **1. Field Definition Schema**
```typescript
// shared/types/CategoryFields.ts
export interface FieldDefinition {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  category: string[];
  subcategory?: string[];
  required: boolean;
  validation: ValidationRule[];
  options?: FieldOptions;
  conditionalLogic?: ConditionalRule[];
  order: number;
  group?: string;
  helpText?: string;
  placeholder?: string;
}

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'multiselect' 
  | 'boolean' 
  | 'date' 
  | 'file' 
  | 'currency'
  | 'measurement'
  | 'rating';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  condition?: ConditionalRule;
}

export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide' | 'require' | 'disable';
}
```

#### **2. Category Field Configurations**
```typescript
// client/src/components/forms/schemas/CategoryFieldConfigurations.ts
export const CATEGORY_FIELD_CONFIGS: Record<string, FieldDefinition[]> = {
  fashion: [
    {
      id: 'material',
      name: 'material',
      label: 'Material',
      type: 'select',
      category: ['fashion'],
      required: false,
      validation: [],
      options: {
        choices: [
          { value: 'cotton', label: 'Cotton' },
          { value: 'polyester', label: 'Polyester' },
          { value: 'wool', label: 'Wool' },
          { value: 'silk', label: 'Silk' },
          { value: 'leather', label: 'Leather' },
          { value: 'synthetic', label: 'Synthetic' }
        ]
      },
      order: 1,
      group: 'details'
    },
    {
      id: 'fit_type',
      name: 'fitType',
      label: 'Fit Type',
      type: 'select',
      category: ['fashion'],
      subcategory: ['clothing'],
      required: false,
      validation: [],
      options: {
        choices: [
          { value: 'regular', label: 'Regular Fit' },
          { value: 'slim', label: 'Slim Fit' },
          { value: 'relaxed', label: 'Relaxed Fit' },
          { value: 'oversized', label: 'Oversized' }
        ]
      },
      order: 2,
      group: 'details'
    },
    {
      id: 'care_instructions',
      name: 'careInstructions',
      label: 'Care Instructions',
      type: 'textarea',
      category: ['fashion'],
      required: false,
      validation: [
        { type: 'maxLength', value: 500, message: 'Care instructions must be under 500 characters' }
      ],
      order: 3,
      group: 'details',
      placeholder: 'e.g., Machine wash cold, tumble dry low'
    }
  ],
  
  cars: [
    {
      id: 'year',
      name: 'year',
      label: 'Year',
      type: 'number',
      category: ['cars'],
      required: true,
      validation: [
        { type: 'required', message: 'Year is required' },
        { type: 'min', value: 1900, message: 'Year must be 1900 or later' },
        { type: 'max', value: new Date().getFullYear() + 1, message: 'Year cannot be in the future' }
      ],
      order: 1,
      group: 'vehicle_details'
    },
    {
      id: 'make',
      name: 'make',
      label: 'Make',
      type: 'select',
      category: ['cars'],
      required: true,
      validation: [
        { type: 'required', message: 'Make is required' }
      ],
      options: {
        choices: [
          { value: 'toyota', label: 'Toyota' },
          { value: 'honda', label: 'Honda' },
          { value: 'ford', label: 'Ford' },
          { value: 'chevrolet', label: 'Chevrolet' },
          { value: 'bmw', label: 'BMW' },
          { value: 'mercedes', label: 'Mercedes-Benz' }
        ]
      },
      order: 2,
      group: 'vehicle_details'
    },
    {
      id: 'mileage',
      name: 'mileage',
      label: 'Mileage',
      type: 'number',
      category: ['cars'],
      required: true,
      validation: [
        { type: 'required', message: 'Mileage is required' },
        { type: 'min', value: 0, message: 'Mileage cannot be negative' }
      ],
      order: 4,
      group: 'vehicle_details',
      options: {
        suffix: 'miles'
      }
    }
  ],
  
  real_estate: [
    {
      id: 'property_type',
      name: 'propertyType',
      label: 'Property Type',
      type: 'select',
      category: ['real_estate'],
      required: true,
      validation: [
        { type: 'required', message: 'Property type is required' }
      ],
      options: {
        choices: [
          { value: 'house', label: 'House' },
          { value: 'apartment', label: 'Apartment' },
          { value: 'condo', label: 'Condominium' },
          { value: 'townhouse', label: 'Townhouse' },
          { value: 'land', label: 'Land' }
        ]
      },
      order: 1,
      group: 'property_details'
    },
    {
      id: 'bedrooms',
      name: 'bedrooms',
      label: 'Bedrooms',
      type: 'number',
      category: ['real_estate'],
      required: false,
      validation: [
        { type: 'min', value: 0, message: 'Bedrooms cannot be negative' },
        { type: 'max', value: 20, message: 'Maximum 20 bedrooms allowed' }
      ],
      order: 2,
      group: 'property_details',
      conditionalLogic: [
        {
          field: 'propertyType',
          operator: 'notEquals',
          value: 'land',
          action: 'show'
        }
      ]
    },
    {
      id: 'square_footage',
      name: 'squareFootage',
      label: 'Square Footage',
      type: 'number',
      category: ['real_estate'],
      required: false,
      validation: [
        { type: 'min', value: 1, message: 'Square footage must be positive' }
      ],
      order: 4,
      group: 'property_details',
      options: {
        suffix: 'sq ft'
      }
    }
  ]
};
```

#### **3. Dynamic Form Component**
```typescript
// client/src/components/forms/DynamicCategoryForm.tsx
interface DynamicCategoryFormProps {
  category: string;
  subcategory?: string;
  initialValues?: Record<string, any>;
  onFieldChange: (field: string, value: any) => void;
  onValidationChange: (isValid: boolean, errors: Record<string, string>) => void;
}

export function DynamicCategoryForm({
  category,
  subcategory,
  initialValues = {},
  onFieldChange,
  onValidationChange
}: DynamicCategoryFormProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Get field definitions for current category
  const fieldDefinitions = useMemo(() => {
    return CategorySchemaManager.getFieldsForCategory(category, subcategory);
  }, [category, subcategory]);

  // Generate dynamic validation schema
  const validationSchema = useMemo(() => {
    return CategorySchemaManager.generateValidationSchema(fieldDefinitions);
  }, [fieldDefinitions]);

  // Filter visible fields based on conditional logic
  const visibleFields = useMemo(() => {
    return CategorySchemaManager.filterVisibleFields(fieldDefinitions, fieldValues);
  }, [fieldDefinitions, fieldValues]);

  // Group fields for better organization
  const fieldGroups = useMemo(() => {
    return CategorySchemaManager.groupFields(visibleFields);
  }, [visibleFields]);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFieldValues(prev => {
      const newValues = { ...prev, [fieldId]: value };
      
      // Validate field and update errors
      const field = fieldDefinitions.find(f => f.id === fieldId);
      if (field) {
        const error = CategorySchemaManager.validateField(field, value, newValues);
        setFieldErrors(prevErrors => ({
          ...prevErrors,
          [fieldId]: error || ''
        }));
      }
      
      onFieldChange(fieldId, value);
      return newValues;
    });
  }, [fieldDefinitions, onFieldChange]);

  // Validate all fields and notify parent
  useEffect(() => {
    const allErrors = CategorySchemaManager.validateAllFields(fieldDefinitions, fieldValues);
    setFieldErrors(allErrors);
    
    const isValid = Object.values(allErrors).every(error => !error);
    onValidationChange(isValid, allErrors);
  }, [fieldDefinitions, fieldValues, onValidationChange]);

  return (
    <div className="dynamic-category-form space-y-6">
      {Object.entries(fieldGroups).map(([groupName, fields]) => (
        <Card key={groupName}>
          <CardHeader>
            <CardTitle>{CategorySchemaManager.getGroupLabel(groupName)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map(field => (
              <CategoryFieldRenderer
                key={field.id}
                field={field}
                value={fieldValues[field.id]}
                error={fieldErrors[field.id]}
                onChange={(value) => handleFieldChange(field.id, value)}
                allValues={fieldValues}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

#### **4. Field Renderer Component**
```typescript
// client/src/components/forms/fields/CategoryFieldRenderer.tsx
interface CategoryFieldRendererProps {
  field: FieldDefinition;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  allValues: Record<string, any>;
  disabled?: boolean;
}

export function CategoryFieldRenderer({
  field,
  value,
  error,
  onChange,
  allValues,
  disabled = false
}: CategoryFieldRendererProps) {
  // Check if field should be disabled based on conditional logic
  const isDisabled = useMemo(() => {
    if (disabled) return true;
    return CategorySchemaManager.isFieldDisabled(field, allValues);
  }, [field, allValues, disabled]);

  // Render appropriate field component based on type
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            field={field}
            value={value || ''}
            onChange={onChange}
            disabled={isDisabled}
            error={error}
          />
        );
      
      case 'textarea':
        return (
          <TextAreaField
            field={field}
            value={value || ''}
            onChange={onChange}
            disabled={isDisabled}
            error={error}
          />
        );
      
      case 'number':
        return (
          <NumberField
            field={field}
            value={value || ''}
            onChange={onChange}
            disabled={isDisabled}
            error={error}
          />
        );
      
      case 'select':
        return (
          <SelectField
            field={field}
            value={value || ''}
            onChange={onChange}
            disabled={isDisabled}
            error={error}
          />
        );
      
      case 'multiselect':
        return (
          <MultiSelectField
            field={field}
            value={value || []}
            onChange={onChange}
            disabled={isDisabled}
            error={error}
          />
        );
      
      case 'boolean':
        return (
          <BooleanField
            field={field}
            value={Boolean(value)}
            onChange={onChange}
            disabled={isDisabled}
            error={error}
          />
        );
      
      case 'date':
        return (
          <DateField
            field={field}
            value={value || null}
            onChange={onChange}
            disabled={isDisabled}
            error={error}
          />
        );
      
      default:
        return (
          <CustomField
            field={field}
            value={value}
            onChange={onChange}
            disabled={isDisabled}
            error={error}
          />
        );
    }
  };

  return (
    <div className="category-field-wrapper">
      {renderField()}
    </div>
  );
}
```

## **🗄️ Database Schema Extensions**

### **Category Field Definitions Table**
```sql
-- Migration: Add category field definitions
CREATE TABLE category_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id VARCHAR(100) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  label VARCHAR(200) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  categories TEXT[] NOT NULL,
  subcategories TEXT[],
  required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB,
  field_options JSONB,
  conditional_logic JSONB,
  field_order INTEGER DEFAULT 0,
  field_group VARCHAR(100),
  help_text TEXT,
  placeholder VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(field_id, categories)
);

-- Migration: Add dynamic fields to listings table
ALTER TABLE listings ADD COLUMN dynamic_fields JSONB DEFAULT '{}';

-- Indexes for performance
CREATE INDEX idx_category_fields_categories ON category_field_definitions USING gin(categories);
CREATE INDEX idx_category_fields_type ON category_field_definitions(field_type);
CREATE INDEX idx_listings_dynamic_fields ON listings USING gin(dynamic_fields);
```

## **🔧 Backend Service Implementation**

### **Category Configuration Service**
```typescript
// server/services/CategoryConfigService.ts
export class CategoryConfigService {
  constructor(private db: Database) {}

  async getFieldDefinitions(
    category: string, 
    subcategory?: string
  ): Promise<FieldDefinition[]> {
    const query = `
      SELECT * FROM category_field_definitions 
      WHERE $1 = ANY(categories)
      AND ($2::text IS NULL OR $2 = ANY(subcategories) OR subcategories IS NULL)
      ORDER BY field_order ASC, created_at ASC
    `;
    
    const result = await this.db.query(query, [category, subcategory]);
    
    return result.rows.map(row => ({
      id: row.field_id,
      name: row.field_name,
      label: row.label,
      type: row.field_type,
      category: row.categories,
      subcategory: row.subcategories,
      required: row.required,
      validation: row.validation_rules || [],
      options: row.field_options || {},
      conditionalLogic: row.conditional_logic || [],
      order: row.field_order,
      group: row.field_group,
      helpText: row.help_text,
      placeholder: row.placeholder
    }));
  }

  async validateDynamicFields(
    category: string,
    dynamicFields: Record<string, any>,
    subcategory?: string
  ): Promise<ValidationResult> {
    const fieldDefinitions = await this.getFieldDefinitions(category, subcategory);
    
    const errors: Record<string, string> = {};
    
    for (const field of fieldDefinitions) {
      const value = dynamicFields[field.name];
      const fieldError = this.validateSingleField(field, value, dynamicFields);
      
      if (fieldError) {
        errors[field.name] = fieldError;
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private validateSingleField(
    field: FieldDefinition,
    value: any,
    allValues: Record<string, any>
  ): string | null {
    // Check conditional logic first
    if (!this.isFieldVisible(field, allValues)) {
      return null; // Skip validation for hidden fields
    }
    
    // Apply validation rules
    for (const rule of field.validation) {
      const error = this.applyValidationRule(rule, value, field);
      if (error) return error;
    }
    
    return null;
  }
}
```

## **📊 Integration with Existing Form**

### **Updated Create Listing Component**
```typescript
// client/src/pages/create-listing.tsx (Updated sections)
export default function CreateListing() {
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, any>>({});
  const [dynamicFieldsValid, setDynamicFieldsValid] = useState(true);
  
  // Existing form setup...
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // ... existing defaults
      dynamicFields: {},
    },
  });

  const selectedCategory = form.watch('category');
  const selectedSubcategory = form.watch('subcategory');

  const handleDynamicFieldChange = useCallback((field: string, value: any) => {
    setDynamicFieldValues(prev => {
      const newValues = { ...prev, [field]: value };
      form.setValue('dynamicFields', newValues);
      return newValues;
    });
  }, [form]);

  const handleDynamicValidationChange = useCallback((isValid: boolean, errors: Record<string, string>) => {
    setDynamicFieldsValid(isValid);
    // Update form errors for dynamic fields
    Object.entries(errors).forEach(([field, error]) => {
      if (error) {
        form.setError(`dynamicFields.${field}` as any, { message: error });
      } else {
        form.clearErrors(`dynamicFields.${field}` as any);
      }
    });
  }, [form]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Existing basic fields... */}
            
            {/* Dynamic Category Fields */}
            {selectedCategory && (
              <DynamicCategoryForm
                category={selectedCategory}
                subcategory={selectedSubcategory}
                initialValues={dynamicFieldValues}
                onFieldChange={handleDynamicFieldChange}
                onValidationChange={handleDynamicValidationChange}
              />
            )}
            
            {/* Submit button with dynamic validation */}
            <Button 
              type="submit" 
              disabled={createListingMutation.isPending || !dynamicFieldsValid}
            >
              {createListingMutation.isPending ? 'Creating...' : 'Create Listing'}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
```

## **🧪 Testing Strategy**

### **Unit Tests**
- Field definition loading and caching
- Validation rule application
- Conditional logic evaluation
- Dynamic schema generation

### **Integration Tests**
- Category switching with field updates
- Form submission with dynamic fields
- Backend validation consistency
- Database field storage and retrieval

### **User Experience Tests**
- Field visibility changes
- Real-time validation feedback
- Accessibility compliance
- Mobile responsiveness

## **✅ Definition of Done**

### **Functional Requirements**
- [ ] Dynamic fields based on category selection
- [ ] Configurable field types and validation
- [ ] Conditional field visibility logic
- [ ] Database integration for field definitions
- [ ] Backward compatibility with existing listings
- [ ] Real-time validation feedback

### **Technical Requirements**
- [ ] Type-safe field configurations
- [ ] Extensible field type system
- [ ] Performance optimized field loading
- [ ] Comprehensive error handling
- [ ] Mobile-responsive field components

### **Quality Requirements**
- [ ] 95% test coverage for dynamic field logic
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Cross-browser compatibility
- [ ] Database migration scripts
- [ ] Documentation for adding new field types
