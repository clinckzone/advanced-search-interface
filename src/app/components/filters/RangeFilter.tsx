"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import { RangeFilter as RangeFilterType } from "@/lib/types/search";

interface RangeFilterProps {
  label: string;
  value?: RangeFilterType;
  onChange: (value: RangeFilterType | undefined) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}

export function RangeFilter({
  label,
  value,
  onChange,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
}: RangeFilterProps) {
  const [localValue, setLocalValue] = useState<RangeFilterType>({
    min: value?.min,
    max: value?.max,
    inclusive: value?.inclusive ?? true,
  });

  const hasAnyValues = () => {
    return localValue.min !== undefined || localValue.max !== undefined;
  };

  const updateValue = (newValue: RangeFilterType) => {
    setLocalValue(newValue);
    onChange(hasAnyValues() ? newValue : undefined);
  };

  const handleMinChange = (value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    const updated = { ...localValue, min: numValue };
    updateValue(updated);
  };

  const handleMaxChange = (value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    const updated = { ...localValue, max: numValue };
    updateValue(updated);
  };

  const handleInclusiveChange = (inclusive: boolean) => {
    const updated = { ...localValue, inclusive };
    updateValue(updated);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1">Minimum</Label>
            <Input
              type="number"
              placeholder={minPlaceholder}
              value={localValue.min ?? ""}
              onChange={(e) => handleMinChange(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1">Maximum</Label>
            <Input
              type="number"
              placeholder={maxPlaceholder}
              value={localValue.max ?? ""}
              onChange={(e) => handleMaxChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${label}-inclusive`}
            checked={localValue.inclusive}
            onCheckedChange={(checked) => handleInclusiveChange(!!checked)}
          />
          <Label
            htmlFor={`${label}-inclusive`}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            Inclusive range (≤ and ≥)
          </Label>
        </div>

        {hasAnyValues() && (
          <div className="text-xs text-muted-foreground">
            Range: {localValue.min ?? "−∞"} {localValue.inclusive ? "≤" : "<"} value{" "}
            {localValue.inclusive ? "≤" : "<"} {localValue.max ?? "∞"}
          </div>
        )}
      </div>
    </div>
  );
}
