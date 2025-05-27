
import React from "react";
import { X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagProps {
    value: any;
    onRemove?: () => void;
    variant?: "default" | "indicator" | "tag_grey" | "tag_green" | "tag_orange" | "tag_red";
    className?: string;
}

export function Tag({ value, onRemove, variant = "default", className }: TagProps) {
    const variantClasses: Record<string, string> = {
        default: "dark:bg-secondary dark:text-secondary-foreground",
        indicator: "text-primary border-primary/50",
        tag_grey: "dark:bg-[#313131] dark:text-[#B0B0B0]",
        tag_green: "dark:bg-[#162d16] dark:text-[#92E8A3] dark:border-[#92E8A3] bg-[#CCE7D9] text-[#16a34a] border-[#16a34a]",
        tag_orange: "dark:bg-[#31301A] dark:text-[#DCD641] dark:border-[#DCD641] bg-[#FBF0D5] text-[#ca8a04] border-[#ca8a04]",
        tag_red: "dark:bg-[#2C2434] dark:text-[#FF8C8C] dark:border-[#FF8C8C] bg-[#f8ecf0] text-[#B0325F] border-[#B0325F]",
    };

    return (
        <Badge 
            variant="outline"
            className={twMerge(
                cn(
                    "flex items-center gap-1 py-1 px-2 text-xs rounded-full border", 
                ),
                onRemove && "pr-1",
                variantClasses[variant],
                className
            )}
        >
            <span className="truncate max-w-[140px]">{value}</span>
            {onRemove && (
                <button
                type="button"
                onClick={onRemove}
                className="rounded-full p-0.5 hover:bg-secondary/80"
                aria-label={`Remove ${value}`}
                >
                <X className="h-3 w-3" />
                </button>
            )}
        </Badge>
    );
}
