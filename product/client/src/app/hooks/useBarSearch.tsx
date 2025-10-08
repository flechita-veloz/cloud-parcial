import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const useBarSearch = (onClearExtra?: () => void) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const debouncedSetSearchTerm = useDebouncedCallback((value: string) => {
    setSearchTerm(value);
  }, 300);
  
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value);
    debouncedSetSearchTerm(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setLocalSearchTerm("");
    onClearExtra?.();
  };

  return {
    searchTerm,
    setSearchTerm,
    localSearchTerm,
    setLocalSearchTerm,
    handleSearchChange,
    clearSearch,
  };
};

export default useBarSearch;