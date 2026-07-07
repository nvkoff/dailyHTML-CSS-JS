"use client";

import { cn } from "@/lib/utils";

export function ChoiceList({
  options,
  value,
  onChange,
  disabled,
  correctIndex,
}: {
  options: string[];
  value: number | null;
  onChange: (index: number) => void;
  disabled?: boolean;
  correctIndex?: number;
}) {
  return (
    <div className="grid gap-2">
      {options.map((option, i) => {
        const isSelected = value === i;
        const isCorrect = correctIndex === i;
        const showResult = disabled && correctIndex !== undefined;
        return (
          <button
            key={i}
            type="button"
            onClick={() => !disabled && onChange(i)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors",
              "hover:bg-accent/60 disabled:cursor-not-allowed",
              isSelected && !showResult && "border-primary bg-accent",
              showResult && isCorrect && "border-success/70 bg-success/10",
              showResult && isSelected && !isCorrect && "border-destructive/70 bg-destructive/10",
              !isSelected && !showResult && "bg-background",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium",
                isSelected && !showResult && "border-primary bg-primary text-primary-foreground",
                showResult && isCorrect && "border-success bg-success text-success-foreground",
                showResult && isSelected && !isCorrect && "border-destructive bg-destructive text-destructive-foreground",
              )}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span className="flex-1 whitespace-pre-wrap">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
