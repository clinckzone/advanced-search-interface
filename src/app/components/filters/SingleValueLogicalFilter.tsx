"use client";

import { useState, KeyboardEvent } from "react";
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
import { X, Plus, ChevronDown } from "lucide-react";
import { LogicalFilter as LogicalFilterType } from "@/lib/types/search";

interface TagSectionProps {
  title: string;
  description: string;
  colorClass: string;
  disabled?: boolean;
  tags: string[];
  onAddTag: (value: string) => void;
  onRemoveTag: (tag: string) => void;
  options?: string[];
}

function TagSection({
  title,
  description,
  colorClass,
  disabled = false,
  tags,
  onAddTag,
  onRemoveTag,
  options,
}: TagSectionProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddTag(inputValue); // Adds a new tag
      setInputValue("");
    }
  };

  const handleOptionSelect = (option: string) => {
    onAddTag(option);
  };

  // Filter out already selected tags from options
  const availableOptions = options ? options.filter((option) => !tags.includes(option)) : [];

  return (
    <div className="space-y-2">
      <div>
        <Label className={`text-xs font-medium ${colorClass}`}>{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-2">
        {options ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={disabled || availableOptions.length === 0}>
              <Button
                variant="outline"
                className="flex-1 justify-between"
                disabled={disabled || availableOptions.length === 0}
              >
                <span className="text-gray-400">
                  {availableOptions.length === 0
                    ? "No more options available"
                    : `Add ${title.toLowerCase()} value...`}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full h-75">
              {availableOptions.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className="cursor-pointer"
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Input
              placeholder={`Add ${title.toLowerCase()} value...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              disabled={disabled}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onAddTag(inputValue)}
              disabled={!inputValue.trim() || disabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </>
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

type SingleValueFilterValue = Omit<LogicalFilterType<string>, "requireAll">;

interface SingleValueLogicalFilterProps {
  label: string;
  value: SingleValueFilterValue;
  onChange: (value: LogicalFilterType<string> | undefined) => void;
  options?: string[];
}

export function SingleValueLogicalFilter({
  label,
  value,
  onChange,
  options,
}: SingleValueLogicalFilterProps) {
  const [localValue, setLocalValue] = useState<SingleValueFilterValue>({
    include: value?.include || [],
    exclude: value?.exclude || [],
    isMultiValue: false,
  });

  const hasAnyValues = () => {
    return (
      (localValue.include && localValue.include.length > 0) ||
      (localValue.exclude && localValue.exclude.length > 0)
    );
  };

  const updateValue = (newValue: SingleValueFilterValue, checkforEmpty: boolean) => {
    setLocalValue(newValue);

    if (checkforEmpty) onChange(hasAnyValues() ? newValue : undefined);
    else onChange(newValue);
  };

  const addTag = (type: "include" | "exclude", tag: string) => {
    if (!tag.trim()) return;

    const currentArray = localValue[type] || [];
    if (currentArray.includes(tag.trim())) return; // Avoid duplicates

    const updated = {
      ...localValue,
      [type]: [...currentArray, tag.trim()],
    };
    updateValue(updated, false);
  };

  const removeTag = (type: "include" | "exclude", tagToRemove: string) => {
    const currentArray = localValue[type] || [];
    const updated = {
      ...localValue,
      [type]: currentArray.filter((tag) => tag !== tagToRemove),
    };
    updateValue(updated, true);
  };

  const shouldDisableSection = (sectionType: "include" | "exclude") => {
    // If this section has values, don't disable it
    if (localValue[sectionType] && localValue[sectionType]!.length > 0) {
      return false;
    }

    // If any other section has values, disable this section
    const otherSections = ["include", "exclude"].filter((section) => section !== sectionType) as (
      | "include"
      | "exclude"
    )[];

    return otherSections.some((section) => localValue[section] && localValue[section]!.length > 0);
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
          disabled={shouldDisableSection("include")}
          tags={localValue.include || []}
          onAddTag={(value) => addTag("include", value)}
          onRemoveTag={(tag) => removeTag("include", tag)}
          options={options}
        />

        <TagSection
          title="Exclude (NOT)"
          description="Exclude all these values"
          colorClass="text-red-600"
          disabled={shouldDisableSection("exclude")}
          tags={localValue.exclude || []}
          onAddTag={(value) => addTag("exclude", value)}
          onRemoveTag={(tag) => removeTag("exclude", tag)}
          options={options}
        />
      </div>
    </div>
  );
}
