"use client";

import { X, Plus } from "lucide-react";
import { useState, KeyboardEvent } from "react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { LogicalFilter as LogicalFilterType } from "@/lib/types/search";

interface TagSectionProps {
  title: string;
  description: string;
  colorClass: string;
  tags: string[];
  onAddTag: (value: string) => void;
  onRemoveTag: (tag: string) => void;
}

function TagSection({
  title,
  description,
  colorClass,
  tags,
  onAddTag,
  onRemoveTag,
}: TagSectionProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddTag(inputValue); // Adds a new tag
      setInputValue("");
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <Label className={`text-xs font-medium ${colorClass}`}>{title}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={`Add ${title.toLowerCase()} value...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button type="button" size="sm" variant="outline" onClick={() => onAddTag(inputValue)}>
          <Plus className="h-4 w-4" />
        </Button>
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
        />

        <TagSection
          title="Exclude (NOT)"
          description="Exclude all these values"
          colorClass="text-red-600"
          tags={localValue.exclude || []}
          onAddTag={(value) => addTag("exclude", value)}
          onRemoveTag={(tag) => removeTag("exclude", tag)}
        />

        <TagSection
          title="Require All (AND)"
          description="Must match all these values"
          colorClass="text-blue-600"
          tags={localValue.requireAll || []}
          onAddTag={(value) => addTag("requireAll", value)}
          onRemoveTag={(tag) => removeTag("requireAll", tag)}
        />
      </div>
    </div>
  );
}
