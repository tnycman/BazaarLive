// Fashion Listing Form - Enterprise-grade React component with validation
import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FashionListingCreateSchema } from '@shared/validation/FashionSchemas';
import { 
  FashionListingCreate, 
  FashionCategory, 
  ProductCondition,
  FashionValidationError
} from '@shared/types/FashionDomain';
import { FASHION_CATEGORY_CONFIG, getCategoryConfig } from '@shared/config/FashionCategoryConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ImageIcon, 
  PlusIcon, 
  XIcon,
  CheckIcon,
  DollarSignIcon,
  TagIcon,
  PackageIcon,
  ShirtIcon,
  PaletteIcon,
  RulerIcon,
  AlertTriangleIcon,
  InfoIcon,
  SparklesIcon,
  TrendingUpIcon
} from 'lucide-react';
import { z } from 'zod';

export interface FashionListingFormProps {
  initialData?: Partial<FashionListingCreate>;
  mode: 'create' | 'edit';
  listingId?: string;
  onSuccess?: (listing: any) => void;
  onCancel?: () => void;
  className?: string;
}

export interface FormValidationState {
  isValid: boolean;
  completionPercentage: number;
  missingRequiredFields: string[];
  warnings: string[];
}

const REQUIRED_FIELDS = [
  'title',
  'description', 
  'fashionCategory',
  'condition',
  'price',
  'images'
] as const;

const RECOMMENDED_FIELDS = [
  'brand',
  'size',
  'color',
  'material',
  'subcategory',
  'originalPrice'
] as const;

export function FashionListingForm({
  initialData,
  mode = 'create',
  listingId,
  onSuccess,
  onCancel,
  className = ''
}: FashionListingFormProps) {
  const { toast } = useToast();
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState<FashionCategory | ''>('');
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [styleTags, setStyleTags] = useState<string[]>(initialData?.styleTags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [currentStyleTag, setCurrentStyleTag] = useState('');
  const [formValidation, setFormValidation] = useState<FormValidationState>({
    isValid: false,
    completionPercentage: 0,
    missingRequiredFields: [...REQUIRED_FIELDS],
    warnings: []
  });

  // Initialize form with validation
  const form = useForm<FashionListingCreate>({
    resolver: zodResolver(FashionListingCreateSchema),
    mode: 'onChange',
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      fashionCategory: initialData?.fashionCategory || '',
      subcategory: initialData?.subcategory || '',
      brand: initialData?.brand || '',
      size: initialData?.size || '',
      color: initialData?.color || '',
      material: initialData?.material || '',
      condition: initialData?.condition || 'good',
      price: initialData?.price || 0,
      originalPrice: initialData?.originalPrice || undefined,
      images: initialData?.images || [],
      tags: initialData?.tags || [],
      styleTags: initialData?.styleTags || [],
      location: initialData?.location || '',
      isPriceNegotiable: initialData?.isPriceNegotiable || false,
      isShippingIncluded: initialData?.isShippingIncluded || false,
      isHandmade: initialData?.isHandmade || false,
      isVintage: initialData?.isVintage || false,
      isLimitedEdition: initialData?.isLimitedEdition || false,
      measurements: initialData?.measurements || {},
      careInstructions: initialData?.careInstructions || [],
      sustainabilityInfo: initialData?.sustainabilityInfo || undefined
    },
  });

  // Get category configuration
  const categoryConfig = useMemo(() => {
    return selectedCategory ? getCategoryConfig(selectedCategory) : null;
  }, [selectedCategory]);

  // Fetch fashion categories
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/fashion/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/fashion/categories');
      return response.data;
    }
  });

  // Form submission mutation
  const submitMutation = useMutation({
    mutationFn: async (data: FashionListingCreate) => {
      const endpoint = mode === 'create' 
        ? '/api/fashion/listings'
        : `/api/fashion/listings/${listingId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      return await apiRequest(method, endpoint, data);
    },
    onSuccess: (response) => {
      toast({
        title: "Success!",
        description: mode === 'create' 
          ? "Your fashion listing has been created successfully."
          : "Your fashion listing has been updated successfully.",
      });
      onSuccess?.(response.data);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to save listing';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Watch form values for validation
  const watchedValues = form.watch();

  // Update form validation state
  useEffect(() => {
    const validateForm = () => {
      const values = form.getValues();
      const fieldErrors = form.formState.errors;
      
      // Check required fields
      const missingRequired = REQUIRED_FIELDS.filter(field => {
        if (field === 'images') return imageUrls.length === 0;
        return !values[field] || values[field] === '';
      });

      // Check for warnings
      const warnings: string[] = [];
      
      if (!values.brand) warnings.push('Adding a brand increases buyer interest');
      if (!values.originalPrice && values.price) warnings.push('Original price helps show value');
      if (imageUrls.length < 3) warnings.push('More photos increase listing views');
      if (!values.size && selectedCategory !== 'accessories') warnings.push('Size information is important for buyers');
      
      // Calculate completion percentage
      const totalFields = REQUIRED_FIELDS.length + RECOMMENDED_FIELDS.length;
      const completedRequired = REQUIRED_FIELDS.length - missingRequired.length;
      const completedRecommended = RECOMMENDED_FIELDS.filter(field => {
        if (field === 'originalPrice') return values[field] && values[field] > 0;
        return values[field] && values[field] !== '';
      }).length;
      
      const completionPercentage = Math.round(
        ((completedRequired * 2 + completedRecommended) / (REQUIRED_FIELDS.length * 2 + RECOMMENDED_FIELDS.length)) * 100
      );

      const isValid = missingRequired.length === 0 && Object.keys(fieldErrors).length === 0;

      setFormValidation({
        isValid,
        completionPercentage,
        missingRequiredFields: missingRequired,
        warnings
      });
    };

    validateForm();
  }, [watchedValues, imageUrls, form.formState.errors, selectedCategory]);

  // Handle category change
  const handleCategoryChange = (category: FashionCategory) => {
    setSelectedCategory(category);
    form.setValue('fashionCategory', category);
    form.setValue('subcategory', ''); // Reset subcategory when category changes
  };

  // Image management
  const addImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      const newUrls = [...imageUrls, url.trim()];
      setImageUrls(newUrls);
      form.setValue('images', newUrls);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    form.setValue('images', newUrls);
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newUrls = [...imageUrls];
    const [removed] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, removed);
    setImageUrls(newUrls);
    form.setValue('images', newUrls);
  };

  // Tag management
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      const newTags = [...tags, currentTag.trim()];
      setTags(newTags);
      form.setValue('tags', newTags);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    form.setValue('tags', newTags);
  };

  // Style tag management
  const addStyleTag = () => {
    if (currentStyleTag.trim() && !styleTags.includes(currentStyleTag.trim())) {
      const newStyleTags = [...styleTags, currentStyleTag.trim()];
      setStyleTags(newStyleTags);
      form.setValue('styleTags', newStyleTags);
      setCurrentStyleTag('');
    }
  };

  const removeStyleTag = (tagToRemove: string) => {
    const newStyleTags = styleTags.filter(tag => tag !== tagToRemove);
    setStyleTags(newStyleTags);
    form.setValue('styleTags', newStyleTags);
  };

  // Form submission
  const onSubmit = (data: FashionListingCreate) => {
    try {
      // Final validation
      if (!formValidation.isValid) {
        toast({
          title: "Validation Error",
          description: "Please complete all required fields before submitting.",
          variant: "destructive",
        });
        return;
      }

      // Add computed fields
      const submissionData = {
        ...data,
        images: imageUrls,
        tags,
        styleTags
      };

      submitMutation.mutate(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Listing Completion</h3>
            </div>
            <Badge 
              variant={formValidation.completionPercentage === 100 ? "default" : "secondary"}
              className="bg-purple-100 text-purple-800"
            >
              {formValidation.completionPercentage}% Complete
            </Badge>
          </div>
          
          <Progress 
            value={formValidation.completionPercentage} 
            className="h-2 mb-3" 
          />
          
          {formValidation.missingRequiredFields.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Required fields: {formValidation.missingRequiredFields.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          
          {formValidation.warnings.length > 0 && formValidation.missingRequiredFields.length === 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <InfoIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <ul className="list-disc list-inside space-y-1">
                  {formValidation.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Fashion Category Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShirtIcon className="w-5 h-5 mr-2" />
                    Fashion Category *
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="fashionCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.keys(FASHION_CATEGORY_CONFIG).map((category) => {
                              const config = getCategoryConfig(category as FashionCategory);
                              const isSelected = field.value === category;
                              
                              return (
                                <Card
                                  key={category}
                                  className={`cursor-pointer transition-all hover:shadow-md ${
                                    isSelected 
                                      ? 'ring-2 ring-purple-500 bg-purple-50' 
                                      : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => handleCategoryChange(category as FashionCategory)}
                                >
                                  <CardContent className="p-4 text-center">
                                    <div className="text-2xl mb-2">{config.icon}</div>
                                    <div className="font-medium text-sm">
                                      {config.subcategories.find(sub => sub.value === category)?.label || category}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PackageIcon className="w-5 h-5 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Vintage Chanel Blazer - Size 6"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Create a descriptive title that includes brand, item type, and key features
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the item's condition, fit, styling tips, and any unique features..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed descriptions with measurements and styling suggestions get more engagement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subcategory - conditional based on selected category */}
                  {selectedCategory && categoryConfig && (
                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subcategory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categoryConfig.subcategories.map((sub) => (
                                <SelectItem key={sub.value} value={sub.value}>
                                  {sub.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TagIcon className="w-5 h-5 mr-2" />
                    Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Chanel, Zara, Vintage"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new_with_tags">New with Tags</SelectItem>
                              <SelectItem value="new_without_tags">New without Tags</SelectItem>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <RulerIcon className="w-4 h-4 mr-1" />
                            Size
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., S, 6, 32x34"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <PaletteIcon className="w-4 h-4 mr-1" />
                            Color
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Black, Navy Blue"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="material"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Cotton, Silk, Denim"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSignIcon className="w-5 h-5 mr-2" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling Price *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input 
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-10"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                value={field.value || ''}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input 
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-10"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                value={field.value || ''}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Show the original retail price to highlight savings
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex flex-col space-y-3">
                    <FormField
                      control={form.control}
                      name="isPriceNegotiable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Price is negotiable</FormLabel>
                            <FormDescription>
                              Allow buyers to make offers
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isShippingIncluded"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Shipping included in price</FormLabel>
                            <FormDescription>
                              Free shipping can increase buyer interest
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Images * (At least 1 required)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <XIcon className="w-3 h-3" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2 bg-purple-600">
                            Main
                          </Badge>
                        )}
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="h-32 border-dashed border-2 hover:border-purple-400"
                      onClick={addImageUrl}
                    >
                      <div className="text-center">
                        <PlusIcon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">Add Image</span>
                      </div>
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormDescription>
                          Upload high-quality photos from multiple angles. The first image will be your main photo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Advanced Options - Collapsible */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced">
                  <AccordionTrigger>
                    <span className="flex items-center">
                      <SparklesIcon className="w-4 h-4 mr-2" />
                      Advanced Options & Tags
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 pt-4">
                      
                      {/* Tags */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3">General Tags</h4>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {tags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="flex items-center space-x-1"
                              >
                                <span>{tag}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="w-4 h-4 p-0 hover:bg-transparent"
                                  onClick={() => removeTag(tag)}
                                >
                                  <XIcon className="w-3 h-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Add a tag (e.g., vintage, designer, sale)"
                              value={currentTag}
                              onChange={(e) => setCurrentTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            />
                            <Button 
                              type="button" 
                              onClick={addTag}
                              disabled={!currentTag.trim()}
                            >
                              Add
                            </Button>
                          </div>
                        </div>

                        {/* Style Tags */}
                        <div>
                          <h4 className="font-medium mb-3">Style Tags</h4>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {styleTags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="outline"
                                className="flex items-center space-x-1 border-purple-200 text-purple-700"
                              >
                                <span>{tag}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="w-4 h-4 p-0 hover:bg-transparent"
                                  onClick={() => removeStyleTag(tag)}
                                >
                                  <XIcon className="w-3 h-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Add style tag (e.g., boho, minimalist, preppy)"
                              value={currentStyleTag}
                              onChange={(e) => setCurrentStyleTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStyleTag())}
                            />
                            <Button 
                              type="button" 
                              onClick={addStyleTag}
                              disabled={!currentStyleTag.trim()}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Special Attributes */}
                      <div>
                        <h4 className="font-medium mb-3">Special Attributes</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="isHandmade"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Handmade Item</FormLabel>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isVintage"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Vintage Item</FormLabel>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="isLimitedEdition"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Limited Edition</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Location */}
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., New York, NY"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Help buyers know where the item is located for shipping/pickup
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Live Preview */}
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUpIcon className="w-4 h-4 mr-2" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {imageUrls.length > 0 && (
                      <img
                        src={imageUrls[0]}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {form.watch('title') || 'Your listing title...'}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-lg font-bold text-green-600">
                          ${form.watch('price') || '0.00'}
                        </p>
                        {form.watch('originalPrice') && form.watch('originalPrice') > 0 && (
                          <p className="text-sm text-gray-500 line-through">
                            ${form.watch('originalPrice')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {form.watch('brand') && (
                        <Badge variant="outline">
                          {form.watch('brand')}
                        </Badge>
                      )}
                      
                      {form.watch('condition') && (
                        <Badge variant="secondary">
                          {form.watch('condition')}
                        </Badge>
                      )}

                      {form.watch('size') && (
                        <Badge variant="outline">
                          Size {form.watch('size')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selling Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>💡 Fashion Selling Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start space-x-2">
                      <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Model or lay flat for photos</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Include measurements for fit guidance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Show any flaws or wear honestly</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Research similar items for competitive pricing</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Use styling suggestions to inspire buyers</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              disabled={submitMutation.isPending}
            >
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
              disabled={!formValidation.isValid || submitMutation.isPending}
            >
              {submitMutation.isPending 
                ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                : (mode === 'create' ? 'Create Fashion Listing' : 'Update Listing')
              }
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
