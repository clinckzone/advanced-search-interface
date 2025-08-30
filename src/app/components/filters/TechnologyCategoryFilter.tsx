"use client";

import { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { X, Plus } from "lucide-react";
import { TechnologyCategoryFilter as TechnologyCategoryFilterType } from "@/lib/types/search";

interface TechnologyCategoryFilterProps {
  label: string;
  value?: TechnologyCategoryFilterType[];
  onChange: (value: TechnologyCategoryFilterType[] | undefined) => void;
}

export function TechnologyCategoryFilter({
  label,
  value,
  onChange,
}: TechnologyCategoryFilterProps) {
  const [filters, setFilters] = useState<TechnologyCategoryFilterType[]>(
    value || [
      {
        category: "",
        minCount: undefined,
        maxCount: undefined,
        operator: "AND",
      },
    ]
  );

  const updateFilters = (newFilters: TechnologyCategoryFilterType[]) => {
    setFilters(newFilters);
    // Only emit onChange if there are filters with valid categories
    const validFilters = newFilters.filter((f) => f.category.trim());
    onChange(validFilters.length > 0 ? validFilters : undefined);
  };

  const addFilter = () => {
    const newFilters = [
      ...filters,
      {
        category: "",
        minCount: undefined,
        maxCount: undefined,
        operator: "AND" as const,
      },
    ];
    updateFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    // Ensure at least one filter remains
    if (newFilters.length === 0) {
      newFilters.push({
        category: "",
        minCount: undefined,
        maxCount: undefined,
        operator: "AND",
      });
    }
    updateFilters(newFilters);
  };

  const updateFilter = (index: number, field: keyof TechnologyCategoryFilterType, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    updateFilters(newFilters);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Button type="button" size="sm" variant="outline" onClick={addFilter}>
          <Plus className="h-4 w-4 mr-1" />
          Add Filter
        </Button>
      </div>

      {filters.map((filter, index) => (
        <Card key={index} className="relative shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Technology Category Filter {index + 1}</CardTitle>
              {filters.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFilter(index)}
                  className="h-5 w-5 p-0 rounded-xs"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground mb-1">Category Name</Label>
                <Input
                  placeholder="e.g., Analytics, E-commerce, CRM..."
                  value={filter.category}
                  onChange={(e) => updateFilter(index, "category", e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1">Min Count (optional)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={filter.minCount || ""}
                  onChange={(e) =>
                    updateFilter(
                      index,
                      "minCount",
                      e.target.value ? parseInt(e.target.value, 10) : undefined
                    )
                  }
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1">Max Count (optional)</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  min="0"
                  value={filter.maxCount || ""}
                  onChange={(e) =>
                    updateFilter(
                      index,
                      "maxCount",
                      e.target.value ? parseInt(e.target.value, 10) : undefined
                    )
                  }
                />
              </div>

              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground mb-1">Operator</Label>
                <Select
                  value={filter.operator}
                  onValueChange={(value: "AND" | "OR" | "NOT") =>
                    updateFilter(index, "operator", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND - Must have this category</SelectItem>
                    <SelectItem value="OR">OR - Can have this category</SelectItem>
                    <SelectItem value="NOT">NOT - Must not have this category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
