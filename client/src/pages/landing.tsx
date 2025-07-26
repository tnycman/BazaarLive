import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShirtIcon, 
  BriefcaseIcon, 
  HomeIcon, 
  CarIcon, 
  ShipIcon, 
  WrenchIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  TruckIcon,
  StarIcon,
  UsersIcon,
  DollarSignIcon,
  PackageIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  SmartphoneIcon,
  TabletIcon
} from "lucide-react";

export default function Landing() {
  const categories = [
    {
      name: "Fashion",
      icon: ShirtIcon,
      description: "Trending styles",
      gradient: "from-pink-500 to-purple-600",
      bgGradient: "from-pink-50 to-purple-50",
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    },
    {
      name: "Jobs", 
      icon: BriefcaseIcon,
      description: "Find opportunities",
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    },
    {
      name: "Real Estate",
      icon: HomeIcon,
      description: "Dream homes",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    },
    {
      name: "Cars",
      icon: CarIcon,
      description: "Quality vehicles",
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    },
    {
      name: "Boats",
      icon: ShipIcon,
      description: "Marine vessels",
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    },
    {
      name: "Services",
      icon: WrenchIcon,
      description: "Expert help",
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-50 to-purple-50",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    },
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: "List It",
      description: "Take photos and list your items in seconds. Our smart AI helps you create perfect listings across all categories.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      gradient: "from-indigo-100 to-purple-100",
      color: "indigo-500"
    },
    {
      step: 2,
      title: "Share It",
      description: "Share your listings with our vibrant community. Join live shows, parties, and connect with buyers who love your style.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      gradient: "from-green-100 to-emerald-100",
      color: "green-500"
    },
    {
      step: 3,
      title: "Earn Cash",
      description: "Get paid instantly when your items sell. Fast shipping, secure payments, and money in your pocket.",
      image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      gradient: "from-orange-100 to-yellow-100", 
      color: "orange-500"
    }
  ];

  const trustFeatures = [
    {
      icon: ShieldCheckIcon,
      title: "Protected Payments",
      description: "If it's not what you ordered, we guarantee to give your money back. Shop worry-free with full purchase protection.",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: StarIcon,
      title: "Posh Authenticate",
      description: "We offer free item authentication and free shipping on all items $500 or more for added peace of mind.",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: TruckIcon,
      title: "Expedited Shipping", 
      description: "All orders ship via USPS Priority Mail. With our prepaid labels, shipping has never been easier!",
      gradient: "from-blue-500 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <header className="glass-morphism border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="text-2xl font-bold text-gradient" data-testid="logo">
                BazaarLive
              </div>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Log in
              </Button>
              <Button 
                className="gradient-primary text-white font-medium rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-signup"
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up" data-testid="text-hero-title">
                Buy, sell, and discover
                <span className="text-gradient ml-2">
                  everything
                </span>
                <br />you love
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}} data-testid="text-hero-description">
                Join millions in our social marketplace. From fashion to real estate, jobs to services - discover unique finds and turn your unused items into cash.
              </p>
              
              {/* Social Auth Buttons */}
              <div className="space-y-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <Button 
                  className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-105"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-facebook-auth"
                >
                  <FacebookIcon className="w-5 h-5" />
                  <span>Continue with Facebook</span>
                </Button>
                <Button 
                  variant="outline"
                  className="w-full max-w-md bg-white hover:bg-gray-50 text-gray-900 font-medium py-6 px-6 rounded-xl border border-gray-300 flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-105"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-google-auth"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </Button>
                <Button 
                  className="w-full max-w-md bg-black hover:bg-gray-800 text-white font-medium py-6 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-105"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-apple-auth"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </Button>
              </div>
            </div>
            
            {/* Right Content - Hero Image */}
            <div className="relative animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="glass-morphism rounded-3xl p-8 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                  alt="Diverse marketplace items" 
                  className="rounded-2xl shadow-lg w-full h-auto"
                  data-testid="img-hero-marketplace"
                />
                
                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 glass-morphism rounded-2xl p-4 shadow-lg animate-float" data-testid="card-real-estate-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 gradient-secondary rounded-full flex items-center justify-center">
                      <HomeIcon className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900" data-testid="text-real-estate-title">Real Estate</p>
                      <p className="text-sm text-gray-600" data-testid="text-real-estate-amount">$2.5M sold</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 glass-morphism rounded-2xl p-4 shadow-lg animate-float" style={{animationDelay: '1s'}} data-testid="card-fashion-float">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <ShirtIcon className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900" data-testid="text-fashion-title">Fashion</p>
                      <p className="text-sm text-gray-600" data-testid="text-fashion-status">Hot trending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-categories-title">
              Explore Our
              <span className="text-gradient ml-2">
                Marketplace
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-categories-description">
              Discover unique items across multiple categories. From fashion to real estate, find what you're looking for.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Card 
                key={category.name}
                className={`group relative bg-gradient-to-br ${category.bgGradient} border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer`}
                data-testid={`card-category-${category.name.toLowerCase().replace(' ', '-')}`}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300`}>
                    <category.icon className="text-white text-xl w-6 h-6" />
                  </div>
                  <img 
                    src={category.image} 
                    alt={`${category.name} items`} 
                    className="rounded-lg mb-3 w-full h-32 object-cover"
                    data-testid={`img-category-${category.name.toLowerCase().replace(' ', '-')}`}
                  />
                  <h3 className="font-semibold text-gray-900 mb-2" data-testid={`text-category-name-${category.name.toLowerCase().replace(' ', '-')}`}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600" data-testid={`text-category-description-${category.name.toLowerCase().replace(' ', '-')}`}>
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-how-it-works-title">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-how-it-works-description">
              Start your marketplace journey in three simple steps
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {howItWorksSteps.map((step, index) => (
              <div key={step.step} className="text-center group" data-testid={`card-step-${step.step}`}>
                <div className="relative mb-8">
                  <div className={`w-32 h-32 bg-gradient-to-r ${step.gradient} rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <img 
                      src={step.image} 
                      alt={step.title} 
                      className="rounded-full w-28 h-28 object-cover"
                      data-testid={`img-step-${step.step}`}
                    />
                  </div>
                  <div className={`absolute -top-2 -right-2 w-8 h-8 bg-${step.color} text-white rounded-full flex items-center justify-center font-bold`} data-testid={`badge-step-${step.step}`}>
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4" data-testid={`text-step-title-${step.step}`}>
                  {step.title}
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto" data-testid={`text-step-description-${step.step}`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6" data-testid="text-community-title">
                Discover The
                <span className="text-gradient ml-2">
                  BazaarLive Community
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8" data-testid="text-community-description">
                BazaarLive connects you to people and closets filled with unique styles, hard-to-find pieces, and endless items to discover. Get started today and join our vibrant & diverse community who make shopping and selling simple, social, and sustainable!
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center" data-testid="stat-users">
                  <div className="text-3xl font-bold text-primary mb-2" data-testid="text-users-count">150M+</div>
                  <div className="text-gray-600" data-testid="text-users-label">Active Users</div>
                </div>
                <div className="text-center" data-testid="stat-gmv">
                  <div className="text-3xl font-bold text-purple-600 mb-2" data-testid="text-gmv-count">$10B+</div>
                  <div className="text-gray-600" data-testid="text-gmv-label">GMV Generated</div>
                </div>
                <div className="text-center" data-testid="stat-items">
                  <div className="text-3xl font-bold text-green-600 mb-2" data-testid="text-items-count">400M+</div>
                  <div className="text-gray-600" data-testid="text-items-label">Items Sold</div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Community Showcase */}
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Diverse community of marketplace users" 
                className="rounded-2xl shadow-2xl"
                data-testid="img-community"
              />
              
              {/* Floating testimonial cards */}
              <div className="absolute -top-6 -left-6 glass-morphism rounded-2xl p-4 shadow-lg max-w-xs animate-float" data-testid="card-testimonial-1">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900" data-testid="text-testimonial-1-author">@sarah_styles</p>
                    <p className="text-sm text-gray-600" data-testid="text-testimonial-1-content">"Sold my designer bag in 2 hours! Amazing community ✨"</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 glass-morphism rounded-2xl p-4 shadow-lg max-w-xs animate-float" style={{animationDelay: '2s'}} data-testid="card-testimonial-2">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900" data-testid="text-testimonial-2-author">@mike_trades</p>
                    <p className="text-sm text-gray-600" data-testid="text-testimonial-2-content">"Found the perfect vintage jacket here 🔥"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-trust-title">
              Shop & Sell With
              <span className="text-gradient ml-2">
                Confidence
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-trust-description">
              Your safety and satisfaction are our top priorities
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {trustFeatures.map((feature, index) => (
              <Card 
                key={feature.title}
                className="glass-morphism border-0 text-center group hover:shadow-xl transition-all duration-300"
                data-testid={`card-trust-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="text-white text-2xl w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4" data-testid={`text-trust-title-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6" data-testid={`text-trust-description-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {feature.description}
                  </p>
                  <Button 
                    variant="link" 
                    className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                    data-testid={`link-trust-learn-more-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    Learn More →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="text-4xl font-bold text-white mb-6" data-testid="text-app-title">
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  BazaarLive
                </span>
              </div>
              <p className="text-xl text-gray-300 mb-8" data-testid="text-app-description">
                Download the app for free on iPhone, iPad and Android.
              </p>
              
              {/* App Store Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-black hover:bg-gray-800 rounded-lg px-6 py-3 flex items-center space-x-3 transition-colors h-auto"
                  data-testid="link-app-store"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Download on the</div>
                    <div className="text-white font-semibold">App Store</div>
                  </div>
                </Button>
                <Button 
                  className="bg-black hover:bg-gray-800 rounded-lg px-6 py-3 flex items-center space-x-3 transition-colors h-auto"
                  data-testid="link-google-play"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-gray-300">GET IT ON</div>
                    <div className="text-white font-semibold">Google Play</div>
                  </div>
                </Button>
              </div>
            </div>
            
            {/* Right Content - Phone Mockup */}
            <div className="text-center lg:text-right">
              <div className="relative inline-block">
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600" 
                  alt="BazaarLive mobile app interface" 
                  className="rounded-3xl shadow-2xl max-w-sm"
                  data-testid="img-mobile-app"
                />
                
                {/* Floating UI elements */}
                <div className="absolute -top-4 -left-4 gradient-primary text-white rounded-2xl p-3 shadow-lg animate-float" data-testid="card-notification-float">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                </div>
                <div className="absolute -bottom-4 -right-4 gradient-secondary text-white rounded-2xl p-3 shadow-lg animate-float" style={{animationDelay: '1s'}} data-testid="card-heart-float">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4" data-testid="text-footer-categories-title">Categories</h3>
              <ul className="space-y-3 text-gray-600">
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-fashion">Fashion</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-jobs">Jobs</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-real-estate">Real Estate</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-cars">Cars</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-boats">Boats</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-services">Services</Button></li>
              </ul>
            </div>
            
            {/* Popular Brands */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4" data-testid="text-footer-brands-title">Popular Brands</h3>
              <ul className="space-y-3 text-gray-600">
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-nike">Nike</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-adidas">Adidas</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-coach">Coach</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-lululemon">Lululemon</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-zara">Zara</Button></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4" data-testid="text-footer-company-title">Company</h3>
              <ul className="space-y-3 text-gray-600">
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-about">About</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-community">Community</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-careers">Careers</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-press">Press</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-600 hover:text-primary" data-testid="link-footer-blog">Blog</Button></li>
              </ul>
            </div>
            
            {/* Connect */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4" data-testid="text-footer-connect-title">Connect With Us</h3>
              <div className="flex space-x-4 mb-4">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary" data-testid="link-social-facebook">
                  <FacebookIcon className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary" data-testid="link-social-twitter">
                  <TwitterIcon className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary" data-testid="link-social-instagram">
                  <InstagramIcon className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary" data-testid="link-social-youtube">
                  <YoutubeIcon className="w-5 h-5" />
                </Button>
              </div>
              <div className="text-gray-600">
                <p className="mb-2" data-testid="text-download-app">Download the app:</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="bg-black text-white border-black hover:bg-gray-800" data-testid="button-ios">
                    <SmartphoneIcon className="w-3 h-3 mr-1" /> iOS
                  </Button>
                  <Button size="sm" variant="outline" className="bg-black text-white border-black hover:bg-gray-800" data-testid="button-android">
                    <TabletIcon className="w-3 h-3 mr-1" /> Android
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="text-2xl font-bold text-gradient" data-testid="text-footer-logo">
                BazaarLive
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600" data-testid="text-footer-tagline">Social Marketplace Platform</span>
            </div>
            <div className="text-gray-500 text-sm" data-testid="text-footer-copyright">
              © 2025 BazaarLive, Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
