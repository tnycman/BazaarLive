import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FashionListingForm } from "@/components/forms/FashionListingForm";
import { useToast } from "@/hooks/use-toast";
import { 
  ShirtIcon,
  InfoIcon,
  SparklesIcon,
  TrendingUpIcon,
  CheckIcon
} from "lucide-react";
import { useLocation } from "wouter";

export default function CreateListing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Handle successful listing creation
  const handleSuccess = (listing: any) => {
    toast({
      title: "Success!",
      description: "Your fashion listing has been created successfully.",
    });
    setLocation('/marketplace');
  };

  // Handle cancel action
  const handleCancel = () => {
    setLocation('/marketplace');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="border-amber-200 bg-amber-50">
            <InfoIcon className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Please sign in to create a listing.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-full">
              <ShirtIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-pink-800 bg-clip-text text-transparent mb-2" data-testid="text-create-listing-title">
            Create Fashion Listing
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto" data-testid="text-create-listing-subtitle">
            List your fashion items and connect with style-conscious buyers across all fashion categories [[memory:5084890]]
          </p>
        </div>

        {/* Fashion Categories Notice */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <SparklesIcon className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Fashion-Only Marketplace</h3>
                <p className="text-blue-800 mb-3">
                  This listing page is specifically designed for fashion items only. Create listings for:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <Badge variant="outline" className="border-blue-300 text-blue-700">👗 Women's Fashion</Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">👔 Men's Fashion</Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">👶 Kids' Fashion</Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">🏠 Home & Lifestyle</Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">📱 Electronics</Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">🐕 Pets</Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">💄 Beauty & Wellness</Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">⚽ Sports & Outdoors</Badge>
                </div>
                <Alert className="mt-4 border-green-200 bg-green-50">
                  <TrendingUpIcon className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>New Enhanced Experience:</strong> This form uses our advanced fashion listing system with category-specific fields, size guides, and style recommendations.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fashion Listing Form */}
        <FashionListingForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          className="bg-white rounded-xl shadow-lg border border-gray-200"
        />

        {/* Success Tips */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-900">
              <CheckIcon className="w-5 h-5 mr-2" />
              Fashion Listing Success Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-green-800">
              <div>
                <h4 className="font-semibold mb-2">📸 Photography</h4>
                <ul className="space-y-1">
                  <li>• Use natural lighting whenever possible</li>
                  <li>• Show front, back, and detail shots</li>
                  <li>• Include photos of any flaws or wear</li>
                  <li>• Model the item or use a flat lay style</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📏 Measurements & Details</h4>
                <ul className="space-y-1">
                  <li>• Include accurate measurements</li>
                  <li>• Specify material and care instructions</li>
                  <li>• Mention fit (runs small/large/true to size)</li>
                  <li>• Add styling suggestions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">💰 Pricing Strategy</h4>
                <ul className="space-y-1">
                  <li>• Research similar items for competitive pricing</li>
                  <li>• Show original price to highlight savings</li>
                  <li>• Consider accepting offers for faster sales</li>
                  <li>• Factor in item condition and demand</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🏷️ Tags & Keywords</h4>
                <ul className="space-y-1">
                  <li>• Use relevant style tags (boho, minimalist, etc.)</li>
                  <li>• Include occasion tags (work, casual, formal)</li>
                  <li>• Add season tags for seasonal items</li>
                  <li>• Mention notable features (pockets, stretch, etc.)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
