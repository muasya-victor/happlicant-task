// components/ui/table-empty.tsx
import { FileText, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TableEmptyProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: "default" | "search" | "upload";
}

export default function TableEmpty({
  title = "No data available",
  description = "Get started by creating your first item.",
  icon: Icon = FileText,
  actionLabel = "Create New",
  onAction,
  className,
  variant = "default",
}: TableEmptyProps) {
  const getIcon = () => {
    if (variant === "search") return Search;
    if (variant === "upload") return Plus;
    return Icon;
  };

  const getDefaultContent = () => {
    const VariantIcon = getIcon();

    switch (variant) {
      case "search":
        return {
          title: "No results found",
          description:
            "Try adjusting your search or filter to find what you're looking for.",
          icon: VariantIcon,
        };
      case "upload":
        return {
          title: "No files uploaded",
          description: "Upload your first file to get started.",
          icon: VariantIcon,
        };
      default:
        return {
          title,
          description,
          icon: VariantIcon,
        };
    }
  };

  const content = getDefaultContent();
  const DisplayIcon = content.icon;

  return (
    <Card className={cn("bg-muted/20 border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        {/* Icon Container */}
        <div className="bg-muted/50 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          <DisplayIcon className="text-muted-foreground h-8 w-8" />
        </div>

        {/* Text Content */}
        <div className="max-w-sm space-y-3">
          <h3 className="text-foreground text-lg font-semibold">
            {content.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* Action Button */}
        {onAction && (
          <Button onClick={onAction} className="mt-6" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}




