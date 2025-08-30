"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { StringFilter as StringFilterType } from "@/lib/types/search";

interface StringFilterProps {
  label: string;
  value?: StringFilterType;
  onChange: (value: StringFilterType | undefined) => void;
  placeholder?: string;
}

export function StringFilter({ label, value, onChange, placeholder }: StringFilterProps) {
  const [localValue, setLocalValue] = useState<StringFilterType>({
    value: value?.value || "",
    matchType: value?.matchType || "contains",
    caseSensitive: value?.caseSensitive || false,
  });

  const handleValueChange = (newValue: string) => {
    const updated = { ...localValue, value: newValue };
    setLocalValue(updated);
    // Only emit onChange if there's an actual value
    onChange(newValue.trim() ? updated : undefined);
  };

  const handleMatchTypeChange = (matchType: "exact" | "contains" | "startsWith" | "endsWith") => {
    const updated = { ...localValue, matchType };
    setLocalValue(updated);
    onChange(localValue.value.trim() ? updated : undefined);
  };

  const handleCaseSensitiveChange = (caseSensitive: boolean) => {
    const updated = { ...localValue, caseSensitive };
    setLocalValue(updated);
    onChange(localValue.value.trim() ? updated : undefined);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      <div className="space-y-2">
        <Input
          placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
          value={localValue.value}
          onChange={(e) => handleValueChange(e.target.value)}
        />

        <div className="flex items-center space-x-4">
          <div className="flex flex-col flex-1 gap-1">
            <Label className="text-xs text-muted-foreground">Match Type</Label>
            <Select
              value={localValue.matchType}
              onValueChange={(value: "exact" | "contains" | "startsWith" | "endsWith") =>
                handleMatchTypeChange(value)
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="exact">Exact Match</SelectItem>
                <SelectItem value="startsWith">Starts With</SelectItem>
                <SelectItem value="endsWith">Ends With</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${label}-case-sensitive`}
              checked={localValue.caseSensitive}
              onCheckedChange={(checked) => handleCaseSensitiveChange(!!checked)}
            />
            <Label
              htmlFor={`${label}-case-sensitive`}
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Case sensitive
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
