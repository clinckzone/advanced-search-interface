"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface DropdownOptions {
  countries: string[];
  categories: string[];
  technologyCategories: string[];
}

interface DropdownOptionsContextType {
  options: DropdownOptions;
  loading: boolean;
  error: string | null;
  refreshOptions: () => Promise<void>;
  searchTechnologies: (query: string) => Promise<string[]>;
}

const DropdownOptionsContext = createContext<DropdownOptionsContextType | undefined>(undefined);

const CACHE_KEY = "dropdown-options";
const CACHE_EXPIRY_KEY = "dropdown-options-expiry";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function DropdownOptionsProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<DropdownOptions>({
    countries: [],
    categories: [],
    technologyCategories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFromCache = (): DropdownOptions | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);

      if (cached && expiry && Date.now() < parseInt(expiry, 10)) {
        return JSON.parse(cached);
      }
      return null;
    } catch {
      return null;
    }
  };

  const saveToCache = (data: DropdownOptions) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
      console.warn("Failed to save dropdown options to localStorage:", error);
    }
  };

  const fetchOptions = async (): Promise<DropdownOptions> => {
    const [countriesRes, categoriesRes, techCategoriesRes] = await Promise.all([
      fetch("/api/options/countries"),
      fetch("/api/options/categories"),
      fetch("/api/options/technology-categories"),
    ]);

    if (!countriesRes.ok || !categoriesRes.ok || !techCategoriesRes.ok) {
      throw new Error("Failed to fetch dropdown options");
    }

    const [countries, categories, technologyCategories] = await Promise.all([
      countriesRes.json(),
      categoriesRes.json(),
      techCategoriesRes.json(),
    ]);

    return {
      countries,
      categories,
      technologyCategories,
    };
  };

  const searchTechnologies = async (query: string): Promise<string[]> => {
    try {
      const response = await fetch(
        `/api/options/technologies?search=${encodeURIComponent(query)}&limit=100&offset=0`
      );

      if (!response.ok) {
        throw new Error("Failed to search technologies");
      }

      const technologies = await response.json();
      return technologies;
    } catch (error) {
      console.error("Error searching technologies:", error);
      return [];
    }
  };

  const refreshOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const newOptions = await fetchOptions();
      setOptions(newOptions);
      saveToCache(newOptions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch options";
      setError(errorMessage);
      console.error("Error fetching dropdown options:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeOptions = async () => {
      // Try to load from cache first
      const cachedOptions = loadFromCache();

      if (cachedOptions) {
        setOptions(cachedOptions);
        setLoading(false);
        // Still fetch in background to update cache if needed
        refreshOptions();
      } else {
        // No cache, fetch fresh data
        await refreshOptions();
      }
    };

    initializeOptions();
  }, []);

  const value: DropdownOptionsContextType = {
    options,
    loading,
    error,
    refreshOptions,
    searchTechnologies,
  };

  return (
    <DropdownOptionsContext.Provider value={value}>{children}</DropdownOptionsContext.Provider>
  );
}

export function useDropdownOptions() {
  const context = useContext(DropdownOptionsContext);
  if (context === undefined) {
    throw new Error("useDropdownOptions must be used within a DropdownOptionsProvider");
  }
  return context;
}

// Individual hooks for specific options
export function useCountries() {
  const { options, loading, error } = useDropdownOptions();
  return {
    countries: options.countries,
    loading,
    error,
  };
}

export function useCategories() {
  const { options, loading, error } = useDropdownOptions();
  return {
    categories: options.categories,
    loading,
    error,
  };
}

export function useTechnologyCategories() {
  const { options, loading, error } = useDropdownOptions();
  return {
    technologyCategories: options.technologyCategories,
    loading,
    error,
  };
}

export function useTechnologies() {
  const { searchTechnologies, loading, error } = useDropdownOptions();
  return {
    searchTechnologies,
    loading,
    error,
  };
}
