"use client";

import { useState } from "react";
import { DomainSearch, DomainSearchOptions } from "@/lib/types/search";

export const useDomainSearch = () => {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState<DomainSearch | null>(null);
  const [currentSearchOptions, setCurrentSearchOptions] = useState<DomainSearchOptions>({
    limit: 50,
    page: 1,
    sortBy: "d.domain",
    sortOrder: "ASC",
  });

  const executeSearch = async (searchParams: DomainSearch, options: DomainSearchOptions) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/domain-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchParams, options }),
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

  const handleSearch = (searchParams: DomainSearch, limit: number) => {
    const newOptions = { ...currentSearchOptions, limit, page: 1 };
    setCurrentSearchParams(searchParams);
    setCurrentSearchOptions(newOptions);
    executeSearch(searchParams, newOptions);
  };

  const handlePageChange = (page: number) => {
    if (!currentSearchParams) return;
    const newOptions = { ...currentSearchOptions, page };
    setCurrentSearchOptions(newOptions);
    executeSearch(currentSearchParams, newOptions);
  };

  const handleSort = (sortBy: string, sortOrder: DomainSearchOptions["sortOrder"] | null) => {
    if (!currentSearchParams) return;
    const newSortBy = sortOrder ? sortBy : "d.domain";
    const newSortOrder = sortOrder ? sortOrder : "ASC";
    const newOptions = { ...currentSearchOptions, sortBy: newSortBy, sortOrder: newSortOrder };
    setCurrentSearchOptions(newOptions);
    executeSearch(currentSearchParams, newOptions);
  };

  return {
    searchResults,
    isLoading,
    currentSearchOptions,
    handleSearch,
    handlePageChange,
    handleSort,
  };
};
