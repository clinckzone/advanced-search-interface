"use client";

import { DomainSearchForm } from "@/app/components/DomainSearchForm";
import { DomainDataTable } from "@/app/components/DomainDataTable";
import { useDomainSearch } from "@/lib/hooks/useDomainSearch";
import { Loader2 } from "lucide-react";

export default function Home() {
  const {
    searchResults,
    error,
    isLoading,
    currentSearchOptions,
    handleSearch,
    handlePageChange,
    handleSort,
  } = useDomainSearch();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Domain Search</h1>
          <p className="text-muted-foreground">Search and filter domains using advanced criteria</p>
        </div>

        <DomainSearchForm onSearch={handleSearch} isLoading={isLoading} />

        <div className="mt-8">
          {isLoading && (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col gap-1 justify-center items-center bg-card border rounded-md p-6 text-center text-gray-500">
                <Loader2 className="animate-spin" /> Loading Results
              </div>
            </div>
          )}
          {error && (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center items-center border-1 bg-red-50 border-red-200 rounded-md p-6">
                <div className="text-red-600">{error}</div>
              </div>
            </div>
          )}
          {searchResults && !isLoading && !error && (
            <DomainDataTable
              data={searchResults}
              itemsPerPage={currentSearchOptions.limit}
              currentPage={currentSearchOptions.page}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              currentSortField={currentSearchOptions.sortBy}
              currentSortOrder={currentSearchOptions.sortOrder}
              onSort={handleSort}
            />
          )}
        </div>
      </div>
    </div>
  );
}
