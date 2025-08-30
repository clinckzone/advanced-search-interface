"use client";

import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import { DomainSearch } from "@/lib/types/search";
import { RangeFilter as RangeFilterComponent } from "./filters/RangeFilter";
import { TechnologyCategoryFilter } from "./filters/TechnologyCategoryFilter";
import { StringFilter as StringFilterComponent } from "./filters/StringFilter";
import { SingleValueLogicalFilter } from "./filters/SingleValueLogicalFilter";
import { useDropdownOptions } from "../contexts/DropdownOptionsContext";
import { MultiValueLogicalFilter } from "./filters/MultiValueLogicalFilter";

interface DomainSearchFormProps {
  onSearch: (searchParams: DomainSearch, limit: number) => void;
  isLoading?: boolean;
}

export function DomainSearchForm({ onSearch, isLoading = false }: DomainSearchFormProps) {
  const [searchParams, setSearchParams] = useState<DomainSearch>({});
  const [limit, setLimit] = useState<number>(50);

  const { options, error, loading } = useDropdownOptions();
  const { countries, categories, technologyCategories } = options;

  const handleReset = () => {
    setSearchParams({});
    setLimit(50);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (searchParams.domain?.value) count++;
    if (searchParams.companyName?.value) count++;
    if (
      searchParams.category &&
      Object.values(searchParams.category).some((arr) => Array.isArray(arr) && arr.length > 0)
    )
      count++;
    if (
      searchParams.country &&
      Object.values(searchParams.country).some((arr) => Array.isArray(arr) && arr.length > 0)
    )
      count++;
    if (
      searchParams.technologies &&
      Object.values(searchParams.technologies).some((arr) => Array.isArray(arr) && arr.length > 0)
    )
      count++;
    if (searchParams.technologyCategories && searchParams.technologyCategories.length > 0) count++;
    if (
      searchParams.totalSpendRange &&
      (searchParams.totalSpendRange.min !== undefined ||
        searchParams.totalSpendRange.max !== undefined)
    )
      count++;
    if (
      searchParams.technologyCountRange &&
      (searchParams.technologyCountRange.min !== undefined ||
        searchParams.technologyCountRange.max !== undefined)
    )
      count++;
    return count;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Domain Search Filters</CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? "s" : ""}
              </Badge>
            )}
            <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              type="button"
              onClick={() => onSearch(searchParams, limit)}
              disabled={isLoading || getActiveFilterCount() === 0}
            >
              <Search className="h-4 w-4 mr-1" />
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Search Filters */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Search</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <StringFilterComponent
              label="Domain"
              value={searchParams.domain}
              onChange={(value) => setSearchParams((prev) => ({ ...prev, domain: value }))}
              placeholder="Enter domain name..."
            />

            <StringFilterComponent
              label="Company Name"
              value={searchParams.companyName}
              onChange={(value) => setSearchParams((prev) => ({ ...prev, companyName: value }))}
              placeholder="Enter company name..."
            />
          </div>
        </div>

        <Separator />

        {/* Logical Filters */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Category & Location</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <SingleValueLogicalFilter
              label="Category"
              value={searchParams.category || { include: [], exclude: [], isMultiValue: false }}
              onChange={(value) => setSearchParams((prev) => ({ ...prev, category: value }))}
              options={categories}
            />

            <SingleValueLogicalFilter
              label="Country"
              value={searchParams.country || { include: [], exclude: [], isMultiValue: false }}
              onChange={(value) => setSearchParams((prev) => ({ ...prev, country: value }))}
              options={countries}
            />
          </div>
        </div>

        <Separator />

        {/* Technology Filters */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Technology Filters</h3>

          <div className="space-y-6">
            <MultiValueLogicalFilter
              label="Technologies"
              value={searchParams.technologies}
              onChange={(value) => setSearchParams((prev) => ({ ...prev, technologies: value }))}
            />

            <TechnologyCategoryFilter
              label="Technology Categories"
              value={searchParams.technologyCategories}
              onChange={(value) =>
                setSearchParams((prev) => ({ ...prev, technologyCategories: value }))
              }
            />
          </div>
        </div>

        <Separator />

        {/* Range Filters */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Numeric Ranges</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <RangeFilterComponent
              label="Total Spend Range"
              value={searchParams.totalSpendRange}
              onChange={(value) => setSearchParams((prev) => ({ ...prev, totalSpendRange: value }))}
              minPlaceholder="Min spend ($)"
              maxPlaceholder="Max spend ($)"
            />

            <RangeFilterComponent
              label="Technology Count Range"
              value={searchParams.technologyCountRange}
              onChange={(value) =>
                setSearchParams((prev) => ({ ...prev, technologyCountRange: value }))
              }
              minPlaceholder="Min count"
              maxPlaceholder="Max count"
            />
          </div>
        </div>

        {/* Search Options */}
        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Search Options</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <Label className="block text-xs text-muted-foreground mb-1">Results per page</Label>
              <Select
                value={(limit || 50).toString()}
                onValueChange={(value) => setLimit(parseInt(value))}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
