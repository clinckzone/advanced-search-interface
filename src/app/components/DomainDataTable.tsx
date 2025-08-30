"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { SortableColumnHeader } from "./SortableColumnHeader";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { Badge } from "@/app/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { DomainSearchOptions, DomainSearchResult } from "@/lib/types";

type DomainDataTableProps = {
  data: DomainSearchResult;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  currentSortField?: string;
  currentSortOrder?: DomainSearchOptions["sortOrder"];
  onSort?: (field: string, order: DomainSearchOptions["sortOrder"] | null) => void;
};

export function DomainDataTable({
  data,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  isLoading = false,
  currentSortField,
  currentSortOrder,
  onSort,
}: DomainDataTableProps) {
  const { domains, totalCount } = data;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Calculate pagination range
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const truncateText = (text: string | null, maxLength: number = 30) => {
    if (!text) return "N/A";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (!domains || domains.length === 0) {
    console.log(domains);
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No domains found matching your search criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Search Results</span>
            <Badge variant="secondary">
              {totalCount} {totalCount === 1 ? "domain" : "domains"} found
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableColumnHeader
                    title="Domain"
                    sortField="d.domain"
                    currentSortField={currentSortField}
                    currentSortOrder={currentSortOrder}
                    onSort={onSort || (() => {})}
                  />
                  <SortableColumnHeader
                    title="Company"
                    sortField="d.company_name"
                    currentSortField={currentSortField}
                    currentSortOrder={currentSortOrder}
                    onSort={onSort || (() => {})}
                  />
                  <SortableColumnHeader
                    title="Category"
                    sortField="d.category"
                    currentSortField={currentSortField}
                    currentSortOrder={currentSortOrder}
                    onSort={onSort || (() => {})}
                  />
                  <SortableColumnHeader
                    title="Location"
                    sortField="d.country"
                    currentSortField={currentSortField}
                    currentSortOrder={currentSortOrder}
                    onSort={onSort || (() => {})}
                  />
                  <SortableColumnHeader
                    title="Technologies"
                    sortField="ds.total_technologies"
                    currentSortField={currentSortField}
                    currentSortOrder={currentSortOrder}
                    onSort={onSort || (() => {})}
                    align="right"
                  />
                  <SortableColumnHeader
                    title="Total Spend"
                    sortField="ds.total_spend"
                    currentSortField={currentSortField}
                    currentSortOrder={currentSortOrder}
                    onSort={onSort || (() => {})}
                    align="right"
                  />
                  <TableHead>Top Technology Categories</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {domain.domain}
                        </span>
                        <span className="text-xs text-muted-foreground">ID: {domain.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {domain.company_name ? (
                        <span title={domain.company_name}>
                          {truncateText(domain.company_name, 25)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {domain.category ? (
                        <Badge variant="outline">{domain.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        {domain.country && <span>{domain.country}</span>}
                        {domain.state && (
                          <span className="text-muted-foreground">{domain.state}</span>
                        )}
                        {!domain.country && !domain.state && (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {domain.technologyStats.total_technologies}
                        </span>
                        <span className="text-xs text-muted-foreground">technologies</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-medium">
                          {formatCurrency(domain.technologyStats.total_spend)}
                        </span>
                        <span className="text-xs text-muted-foreground">total spend</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(domain.technologyStats.technologyCategories)
                          .slice(0, 3)
                          .map(([category, count]) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category} ({count})
                            </Badge>
                          ))}
                        {Object.keys(domain.technologyStats.technologyCategories).length > 3 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Badge variant="outline" className="text-xs cursor-pointer">
                                +
                                {Object.keys(domain.technologyStats.technologyCategories).length -
                                  3}{" "}
                                more
                              </Badge>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto">
                              <div className="flex flex-col gap-2">
                                {Object.entries(domain.technologyStats.technologyCategories)
                                  .slice(3)
                                  .map(([category, count]) => (
                                    <Badge key={category} variant="secondary" className="text-xs">
                                      {category} ({count})
                                    </Badge>
                                  ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
                Showing {domains.length} of {totalCount} domains
              </TableCaption>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1 && onPageChange && !isLoading) {
                      onPageChange(currentPage - 1);
                    }
                  }}
                  className={currentPage <= 1 || isLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {getVisiblePages().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onPageChange && !isLoading) {
                          onPageChange(page as number);
                        }
                      }}
                      isActive={currentPage === page}
                      className={isLoading ? "pointer-events-none opacity-50" : ""}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages && onPageChange && !isLoading) {
                      onPageChange(currentPage + 1);
                    }
                  }}
                  className={
                    currentPage >= totalPages || isLoading ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
