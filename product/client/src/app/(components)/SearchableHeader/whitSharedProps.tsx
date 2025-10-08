import React from "react";
import { SearchableHeader } from "./index"; 
import type { SearchableHeaderProps, Option } from "./index"; 

export const withSharedSearchableProps = (
  sharedProps: Omit<SearchableHeaderProps, "field" | "headerName">
) => {
  const WrappedSearchableHeader = (field: string, headerName: string, options?: Option[]) => (
    <SearchableHeader
      field={field}
      headerName={headerName}
      options={options}
      {...sharedProps}
    />
  );
  WrappedSearchableHeader.displayName = "WrappedSearchableHeader";
  return WrappedSearchableHeader;
};