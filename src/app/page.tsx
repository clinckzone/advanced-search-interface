"use client";

import { useState } from "react";
import { DomainSearchForm } from "@/app/components/DomainSearchForm";
import { DomainDataTable } from "@/app/components/DomainDataTable";
import { DomainSearch, DomainSearchOptions } from "@/lib/types/search";

export default function Home() {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState<DomainSearch | null>(null);
  const [currentSearchOptions, setCurrentSearchOptions] = useState<DomainSearchOptions>({
    limit: 50,
    page: 1,
    sortBy: "domain",
    sortOrder: "ASC",
  });

  const handleSearch = async (searchParams: DomainSearch, limit: number) => {
    setIsLoading(true);
    setCurrentSearchParams(searchParams);
    setCurrentSearchOptions((prev) => {
      return { ...prev, limit };
    });

    try {
      const response = await fetch("/api/domain-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchParams,
          options: { ...currentSearchParams, limit },
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ error: "Search failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (!currentSearchParams) return;

    setIsLoading(true);
    setCurrentSearchOptions((prev) => {
      return { ...prev, page };
    });

    try {
      const response = await fetch("/api/domain-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchParams: currentSearchParams,
          options: { ...currentSearchOptions, page },
        }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ error: "Search failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

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
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
