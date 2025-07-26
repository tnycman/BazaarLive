import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShirtIcon, 
  BriefcaseIcon, 
  HomeIcon, 
  CarIcon, 
  ShipIcon, 
  WrenchIcon,
  TrendingUpIcon
} from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: string;
  count: string;
  trend: string;
  color: string;
  'data-testid'?: string;
}

const iconMap = {
  shirt: ShirtIcon,
  briefcase: BriefcaseIcon,
  home: HomeIcon,
  car: CarIcon,
  ship: ShipIcon,
  wrench: WrenchIcon,
};

const colorMap = {
  pink: {
    gradient: "from-pink-500 to-purple-600",
    bg: "from-pink-50 to-purple-50",
    text: "text-pink-600"
  },
  blue: {
    gradient: "from-blue-500 to-indigo-600", 
    bg: "from-blue-50 to-indigo-50",
    text: "text-blue-600"
  },
  green: {
    gradient: "from-green-500 to-emerald-600",
    bg: "from-green-50 to-emerald-50", 
    text: "text-green-600"
  },
  orange: {
    gradient: "from-orange-500 to-red-600",
    bg: "from-orange-50 to-red-50",
    text: "text-orange-600"
  },
  cyan: {
    gradient: "from-cyan-500 to-blue-600",
    bg: "from-cyan-50 to-blue-50",
    text: "text-cyan-600"
  },
  purple: {
    gradient: "from-violet-500 to-purple-600",
    bg: "from-violet-50 to-purple-50",
    text: "text-purple-600"
  }
};

export function CategoryCard({ name, icon, count, trend, color, ...props }: CategoryCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || ShirtIcon;
  const colors = colorMap[color as keyof typeof colorMap] || colorMap.pink;

  return (
    <Card 
      className={`group relative bg-gradient-to-br ${colors.bg} border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer`}
      {...props}
    >
      <CardContent className="p-4">
        <div className={`w-10 h-10 bg-gradient-to-r ${colors.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform duration-300`}>
          <IconComponent className="text-white w-5 h-5" />
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 text-sm" data-testid={`text-category-name`}>
            {name}
          </h3>
          <p className="text-xs text-gray-600" data-testid={`text-category-count`}>
            {count} items
          </p>
          <div className="flex items-center space-x-1">
            <TrendingUpIcon className="w-3 h-3 text-green-500" />
            <span className={`text-xs font-medium ${colors.text}`} data-testid={`text-category-trend`}>
              {trend}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
