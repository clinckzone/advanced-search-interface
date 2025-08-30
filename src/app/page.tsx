"use client";

import { DomainSearchForm } from "@/app/components/DomainSearchForm";
import { DomainDataTable } from "@/app/components/DomainDataTable";
import { useDomainSearch } from "@/lib/hooks/useDomainSearch";

export default function Home() {
  const {
    searchResults,
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

        {searchResults && (
          <div className="mt-8">
            {searchResults.error ? (
              <div className="max-w-4xl mx-auto">
                <div className="bg-card border rounded-lg p-6">
                  <div className="text-red-600">{searchResults.error}</div>
                </div>
              </div>
            ) : (
              <DomainDataTable
                data={searchResults.data}
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
        )}
      </div>
    </div>
  );
}
