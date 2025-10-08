"use client";

import React from "react";
import { ArrowUpDown, Filter, Search } from "lucide-react";

export interface Option {
  value: string;
  text: string;
}

export interface SearchableHeaderProps {
  field: string;
  headerName: string;
  fieldFocus: string;
  searchingFields: { [key: string]: boolean };
  localSearchTerms: { [key: string]: string };
  setFieldFocus: (field: string) => void;
  setSearchingFields: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  handleSearchChange: (field: string, value: string) => void;

  options?: Option[];
}

export const SearchableHeader: React.FC<SearchableHeaderProps> = ({
  field,
  headerName,
  fieldFocus,
  searchingFields,
  localSearchTerms,
  setFieldFocus,
  setSearchingFields,
  handleSearchChange,
  options,
}) => {
  let Icon;
  if (options) Icon = Filter;
  else if (field === "date") Icon = ArrowUpDown;
  else Icon = Search;

  return (
    <div
      className="searchable-header-default group"
      onClick={() => {
        if (field !== "date") {
          setFieldFocus(field);
          setSearchingFields((prev) => ({ ...prev, [field]: true }));
        }
      }}
    >
      {searchingFields[field] ? (
        options && options ? (
          <select
            value={localSearchTerms[field] || ""}
            onChange={(e) => handleSearchChange(field, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.text}
              </option>
            ))}
          </select>
        ) : (
          <input
            autoFocus={fieldFocus === field}
            type="text"
            placeholder={headerName}
            value={localSearchTerms[field] || ""}
            onChange={(e) => handleSearchChange(field, e.target.value)}
          />
        )
      ) : (
        <>
          {headerName} <Icon size={16} className="icon" />
        </>
      )}
    </div>
  );
};