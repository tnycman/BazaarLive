// Chart container component for consistent styling
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function ChartContainer({ 
  children, 
  className,
  title,
  description 
}: ChartContainerProps) {
  return (
    <div className={cn("w-full", className)} data-testid="chart-container">
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
}