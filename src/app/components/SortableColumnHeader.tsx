"use client";

import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/app/components/ui/table";
import { Button } from "@/app/components/ui/button";
import { DomainSearchOptions } from "@/lib/types";

type SortableColumnHeaderProps = {
  title: string;
  sortField: string;
  currentSortField?: string;
  currentSortOrder?: DomainSearchOptions["sortOrder"];
  onSort: (field: string, order: DomainSearchOptions["sortOrder"] | null) => void;
  className?: string;
  align?: "left" | "center" | "right";
};

export function SortableColumnHeader({
  title,
  sortField,
  currentSortField,
  currentSortOrder,
  onSort,
  className = "",
  align = "left",
}: SortableColumnHeaderProps) {
  const isActive = currentSortField === sortField;
  const nextSortOrder = getNextSortOrder(isActive ? currentSortOrder || null : null);

  const handleSort = () => {
    onSort(sortField, nextSortOrder);
  };

  const getSortIcon = () => {
    if (!isActive || !currentSortOrder) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    }

    if (currentSortOrder === "ASC") {
      return <ChevronUp className="h-4 w-4 text-foreground" />;
    }

    return <ChevronDown className="h-4 w-4 text-foreground" />;
  };

  const getAlignmentClass = () => {
    switch (align) {
      case "center":
        return "text-center justify-center";
      case "right":
        return "text-right justify-end";
      default:
        return "text-left justify-start";
    }
  };

  return (
    <TableHead className={`${className} ${getAlignmentClass()}`}>
      <Button
        variant="ghost"
        size="sm"
        className={`h-auto p-1 font-medium hover:bg-transparent ${getAlignmentClass()}`}
        onClick={handleSort}
      >
        <span className="mr-2">{title}</span>
        {getSortIcon()}
      </Button>
    </TableHead>
  );
}

// Helper function to determine the next sort order in the cycle
function getNextSortOrder(
  currentOrder: DomainSearchOptions["sortOrder"] | null
): DomainSearchOptions["sortOrder"] | null {
  switch (currentOrder) {
    case null:
      return "ASC";
    case "ASC":
      return "DESC";
    case "DESC":
      return null;
    default:
      return "ASC";
  }
}
