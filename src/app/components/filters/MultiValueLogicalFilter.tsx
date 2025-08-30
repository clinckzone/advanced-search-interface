"use client";

import { X, Plus, ChevronDown, Loader2 } from "lucide-react";
import { useState, KeyboardEvent, useEffect, useCallback, useRef } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { LogicalFilter as LogicalFilterType } from "@/lib/types/search";
import { useTechnologies } from "@/app/contexts/DropdownOptionsContext";

interface TechnologyDropdownWithSearchProps {
  searchTechnologies: (query: string) => Promise<string[]>;
  selectedValue: string;
  onSelect: (value: string) => void;
}

function TechnologyDropdownWithSearch({
  searchTechnologies,
  selectedValue,
  onSelect,
}: TechnologyDropdownWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      setLoading(true);
      try {
        const results = await searchTechnologies(query);
        setOptions(results);
      } catch (error) {
        console.error("Error searching technologies:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTechnologies]
  );

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // Load initial results when dropdown opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchTerm("");
    } else {
      // Load first 100 technologies when opening without search
      debouncedSearch(searchTerm || ""); // Use space to get initial results
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="text-gray-400">{selectedValue || "Select technology..."}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[500px] h-75">
        <div className="px-1 py-2" onSelect={(e) => e.preventDefault()}>
          <Input
            ref={inputRef}
            placeholder="Search technologies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={(e) => inputRef.current?.focus()}
            autoFocus
            className="h-8 shadow-none"
          />
        </div>
        {loading ? (
          <div className="flex justify-center items-center w-full h-full">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="h-60 overflow-y-scroll pt-1">
            {options.length > 0 ? (
              options.map((option) => (
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
                No technologies found
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface TagSectionProps {
  title: string;
  description: string;
  colorClass: string;
  tags: string[];
  onAddTag: (value: string) => void;
  onRemoveTag: (tag: string) => void;
  searchTechnologies?: (query: string) => Promise<string[]>;
}

function TagSection({
  title,
  description,
  colorClass,
  tags,
  onAddTag,
  onRemoveTag,
  searchTechnologies,
}: TagSectionProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddTag(inputValue); // Adds a new tag
      setInputValue("");
    }
  };

  const handleDropdownSelect = (option: string) => {
    onAddTag(option);
    setInputValue(""); // Clear input after selection
  };

  const hasDropdownOptions = !!searchTechnologies;

  return (
    <div className="space-y-2">
      <div>
        <Label className={`text-xs font-medium ${colorClass}`}>{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-2">
        {hasDropdownOptions ? (
          <TechnologyDropdownWithSearch
            searchTechnologies={searchTechnologies}
            selectedValue={inputValue}
            onSelect={handleDropdownSelect}
          />
        ) : (
          <Input
            placeholder={`Add ${title.toLowerCase()} value...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
        )}
        {!hasDropdownOptions && (
          <Button type="button" size="sm" variant="outline" onClick={() => onAddTag(inputValue)}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs pr-0">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

interface MultiValueLogicalFilterProps {
  label: string;
  value?: LogicalFilterType<string>;
  onChange: (value: LogicalFilterType<string> | undefined) => void;
}

export function MultiValueLogicalFilter({ label, value, onChange }: MultiValueLogicalFilterProps) {
  const { searchTechnologies } = useTechnologies();

  const [localValue, setLocalValue] = useState<LogicalFilterType<string>>({
    include: value?.include || [],
    exclude: value?.exclude || [],
    requireAll: value?.requireAll || [],
    isMultiValue: true,
  });

  const hasAnyValues = () => {
    return (
      (localValue.include && localValue.include.length > 0) ||
      (localValue.exclude && localValue.exclude.length > 0) ||
      (localValue.requireAll && localValue.requireAll.length > 0)
    );
  };

  const updateValue = (newValue: LogicalFilterType<string>, checkforEmpty: boolean) => {
    setLocalValue(newValue);

    if (checkforEmpty) onChange(hasAnyValues() ? newValue : undefined);
    else onChange(newValue);
  };

  const addTag = (type: "include" | "exclude" | "requireAll", tag: string) => {
    if (!tag.trim()) return;

    const currentArray = localValue[type] || [];
    if (currentArray.includes(tag.trim())) return; // Avoid duplicates

    const updated = {
      ...localValue,
      [type]: [...currentArray, tag.trim()],
    };
    updateValue(updated, false);
  };

  const removeTag = (type: "include" | "exclude" | "requireAll", tagToRemove: string) => {
    const currentArray = localValue[type] || [];
    const updated = {
      ...localValue,
      [type]: currentArray.filter((tag) => tag !== tagToRemove),
    };
    updateValue(updated, true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
      </div>

      <div className="space-y-4">
        <TagSection
          title="Include (OR)"
          description="Match any of these values"
          colorClass="text-green-600"
          tags={localValue.include || []}
          onAddTag={(value) => addTag("include", value)}
          onRemoveTag={(tag) => removeTag("include", tag)}
          searchTechnologies={searchTechnologies}
        />

        <TagSection
          title="Exclude (NOT)"
          description="Exclude all these values"
          colorClass="text-red-600"
          tags={localValue.exclude || []}
          onAddTag={(value) => addTag("exclude", value)}
          onRemoveTag={(tag) => removeTag("exclude", tag)}
          searchTechnologies={searchTechnologies}
        />

        <TagSection
          title="Require All (AND)"
          description="Must match all these values"
          colorClass="text-blue-600"
          tags={localValue.requireAll || []}
          onAddTag={(value) => addTag("requireAll", value)}
          onRemoveTag={(tag) => removeTag("requireAll", tag)}
          searchTechnologies={searchTechnologies}
        />
      </div>
    </div>
  );
}
