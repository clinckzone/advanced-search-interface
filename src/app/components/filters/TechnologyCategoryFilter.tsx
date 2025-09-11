"use client";

import { useRef, useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { X, Plus, ChevronDown } from "lucide-react";
import { TechnologyCategoryFilter as TechnologyCategoryFilterType } from "@/lib/types/search";

interface CategoryDropdownWithSearchProps {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

function CategoryDropdownWithSearch({
  options,
  selectedValue,
  onSelect,
}: CategoryDropdownWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DropdownMenu onOpenChange={(open) => !open && setSearchTerm("")}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span>{selectedValue || "Select category..."}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[500px] h-75">
        <div className="px-1 py-2" onSelect={(e) => e.preventDefault()}>
          <Input
            ref={inputRef}
            placeholder="Search categories..."
            onBlur={(e) => inputRef.current?.focus()}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="h-8 shadow-none"
          />
        </div>
        <div className="h-60 overflow-y-scroll pt-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <DropdownMenuItem
                key={option}
                onClick={() => onSelect(option)}
                className="cursor-pointer"
              >
                {option}
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              No categories found
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface TechnologyCategoryFilterProps {
  label: string;
  value?: TechnologyCategoryFilterType[];
  onChange: (value: TechnologyCategoryFilterType[] | undefined) => void;
  options?: string[];
}

export function TechnologyCategoryFilter({
  label,
  value,
  onChange,
  options,
}: TechnologyCategoryFilterProps) {
  const [filters, setFilters] = useState<TechnologyCategoryFilterType[]>(
    value || [
      {
        category: "",
        minCount: undefined,
        maxCount: undefined,
        exclude: false,
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
        exclude: false,
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
        exclude: false,
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
        <Card key={index} className="relative shadow-none gap-2">
          <CardHeader className="relative h-0">
            {filters.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFilter(index)}
                className="absolute right-5 top-[-10px] h-6 w-6 p-0 rounded-sm"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground mb-1">Category Name</Label>
                {options ? (
                  <CategoryDropdownWithSearch
                    options={options}
                    selectedValue={filter.category}
                    onSelect={(option) => updateFilter(index, "category", option)}
                  />
                ) : (
                  <Input
                    placeholder="e.g., Analytics, E-commerce, CRM..."
                    value={filter.category}
                    onChange={(e) => updateFilter(index, "category", e.target.value)}
                  />
                )}
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`exclude-${index}`}
                    checked={filter.exclude}
                    onCheckedChange={(checked) => updateFilter(index, "exclude", checked)}
                  />
                  <Label
                    htmlFor={`exclude-${index}`}
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    Exclude this category
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
