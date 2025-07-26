import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertListingSchema } from "@shared/schema";
import { 
  ImageIcon, 
  PlusIcon, 
  XIcon,
  CheckIcon,
  DollarSignIcon,
  TagIcon,
  PackageIcon
} from "lucide-react";
import { z } from "zod";
import { useLocation } from "wouter";

const formSchema = insertListingSchema.extend({
  images: z.array(z.string()).min(1, "At least one image is required"),
});

const categories = [
  { value: 'fashion', label: 'Fashion' },
  { value: 'jobs', label: 'Jobs' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'cars', label: 'Cars' },
  { value: 'boats', label: 'Boats' },
  { value: 'services', label: 'Services' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'sports', label: 'Sports' },
  { value: 'books', label: 'Books' },
  { value: 'toys', label: 'Toys' }
];

const conditions = [
  { value: 'new_with_tags', label: 'New with Tags' },
  { value: 'new_without_tags', label: 'New without Tags' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

export default function CreateListing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'fashion',
      subcategory: '',
      brand: '',
      size: '',
      color: '',
      condition: 'good',
      price: '',
      originalPrice: '',
      images: [],
      tags: [],
      location: '',
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      return await apiRequest('POST', '/api/listings', data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your listing has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      setLocation('/marketplace');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createListingMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-create-listing-title">
            Create New Listing
          </h1>
          <p className="text-gray-600" data-testid="text-create-listing-subtitle">
            List your item and connect with buyers in our marketplace
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card data-testid="card-basic-info">
                  <CardHeader>
                    <CardTitle className="flex items-center" data-testid="text-basic-info-title">
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
                          <FormLabel data-testid="label-title">Title *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Vintage Nike Air Jordans - Size 10"
                              {...field}
                              data-testid="input-title"
                            />
                          </FormControl>
                          <FormDescription>
                            Create a catchy title that describes your item
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
                          <FormLabel data-testid="label-description">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your item's condition, features, and any important details..."
                              className="min-h-[120px]"
                              {...field}
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormDescription>
                            Provide detailed information to help buyers make informed decisions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-category">Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subcategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-subcategory">Subcategory</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Sneakers, Dresses, etc."
                                {...field}
                                data-testid="input-subcategory"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Product Details */}
                <Card data-testid="card-product-details">
                  <CardHeader>
                    <CardTitle className="flex items-center" data-testid="text-product-details-title">
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
                            <FormLabel data-testid="label-brand">Brand</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Nike, Zara, Apple"
                                {...field}
                                data-testid="input-brand"
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
                            <FormLabel data-testid="label-condition">Condition *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-condition">
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {conditions.map((condition) => (
                                  <SelectItem key={condition.value} value={condition.value}>
                                    {condition.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-size">Size</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., L, 10, 32x34"
                                {...field}
                                data-testid="input-size"
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
                            <FormLabel data-testid="label-color">Color</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Black, Navy Blue"
                                {...field}
                                data-testid="input-color"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-location">Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., New York, NY"
                              {...field}
                              data-testid="input-location"
                            />
                          </FormControl>
                          <FormDescription>
                            Help buyers know where the item is located
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card data-testid="card-pricing">
                  <CardHeader>
                    <CardTitle className="flex items-center" data-testid="text-pricing-title">
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
                            <FormLabel data-testid="label-price">Selling Price *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input 
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="pl-10"
                                  {...field}
                                  data-testid="input-price"
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
                            <FormLabel data-testid="label-original-price">Original Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input 
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  className="pl-10"
                                  {...field}
                                  data-testid="input-original-price"
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Optional: Show buyers the original retail price
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Images */}
                <Card data-testid="card-images">
                  <CardHeader>
                    <CardTitle className="flex items-center" data-testid="text-images-title">
                      <ImageIcon className="w-5 h-5 mr-2" />
                      Images *
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group" data-testid={`image-preview-${index}`}>
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
                            data-testid={`button-remove-image-${index}`}
                          >
                            <XIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="h-32 border-dashed border-2 hover:border-primary"
                        onClick={addImageUrl}
                        data-testid="button-add-image"
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
                            Add at least one image of your item. High-quality photos get more views!
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card data-testid="card-tags">
                  <CardHeader>
                    <CardTitle data-testid="text-tags-title">Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="flex items-center space-x-1"
                          data-testid={`tag-${tag}`}
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
                        placeholder="Add a tag..."
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        data-testid="input-tag"
                      />
                      <Button 
                        type="button" 
                        onClick={addTag}
                        disabled={!currentTag.trim()}
                        data-testid="button-add-tag"
                      >
                        Add
                      </Button>
                    </div>
                    
                    <FormDescription>
                      Add relevant tags to help buyers find your item (e.g., vintage, designer, limited edition)
                    </FormDescription>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Preview */}
                <Card className="sticky top-24" data-testid="card-preview">
                  <CardHeader>
                    <CardTitle data-testid="text-preview-title">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {imageUrls.length > 0 && (
                        <img
                          src={imageUrls[0]}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                          data-testid="img-preview"
                        />
                      )}
                      
                      <div>
                        <h3 className="font-semibold text-gray-900" data-testid="text-preview-title-field">
                          {form.watch('title') || 'Your listing title...'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1" data-testid="text-preview-price">
                          ${form.watch('price') || '0.00'}
                        </p>
                      </div>
                      
                      {form.watch('brand') && (
                        <Badge variant="outline" data-testid="badge-preview-brand">
                          {form.watch('brand')}
                        </Badge>
                      )}
                      
                      {form.watch('condition') && (
                        <Badge variant="secondary" data-testid="badge-preview-condition">
                          {conditions.find(c => c.value === form.watch('condition'))?.label}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card data-testid="card-tips">
                  <CardHeader>
                    <CardTitle data-testid="text-tips-title">💡 Selling Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2" data-testid="tip-1">
                        <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Use natural lighting for better photos</span>
                      </li>
                      <li className="flex items-start space-x-2" data-testid="tip-2">
                        <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Include measurements and detailed descriptions</span>
                      </li>
                      <li className="flex items-start space-x-2" data-testid="tip-3">
                        <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Price competitively by checking similar items</span>
                      </li>
                      <li className="flex items-start space-x-2" data-testid="tip-4">
                        <CheckIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Respond quickly to buyer messages</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setLocation('/marketplace')}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gradient-primary text-white px-8"
                disabled={createListingMutation.isPending}
                data-testid="button-submit"
              >
                {createListingMutation.isPending ? 'Creating...' : 'Create Listing'}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
