import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const useColumnSearch = () => {
  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [localSearchTerms, setLocalSearchTerms] = useState<{ [key: string]: string }>({});
  const [searchingFields, setSearchingFields] = useState<{ [key: string]: boolean }>({});
  const [fieldFocus, setFieldFocus] = useState("");

  const debouncedSetSearchTerms = useDebouncedCallback((field: string, value: string) => {
    setSearchTerms((prev) => ({ ...prev, [field]: value }));
  }, 300);

  const handleSearchChange = (field: string, value: string) => {
    setLocalSearchTerms((prev) => ({ ...prev, [field]: value }));
    debouncedSetSearchTerms(field, value);
  };

  const clearSearch = () => {
    setSearchTerms({});
    setSearchingFields({});
    setLocalSearchTerms({});
    setFieldFocus("");
  };

  return {
    searchTerms,
    localSearchTerms,
    searchingFields,
    fieldFocus,
    setFieldFocus,
    setSearchingFields,
    handleSearchChange,
    clearSearch,
  };
};

export default useColumnSearch;