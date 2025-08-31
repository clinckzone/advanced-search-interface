"use client";

import { useState } from "react";
import { DomainSearch, DomainSearchOptions } from "@/lib/types/search";
import { DomainSearchResult } from "../../lib/types/query";

export const useDomainSearch = () => {
  const [searchResults, setSearchResults] = useState<DomainSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

      const result = (await response.json()).data as DomainSearchResult;
      setSearchResults(result);
      setError(null);
    } catch (error) {
      console.error("Search error:", error);
      setError("Search failed. Please try again.");
      setSearchResults(null);
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
    error,
    isLoading,
    currentSearchOptions,
    handleSearch,
    handlePageChange,
    handleSort,
  };
};
