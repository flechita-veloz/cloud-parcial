import React from "react";

type GenericDropDownProps<T> = {
  items: T[];
  selectedItem: T | null;
  searchTerm: string;
  onSelectItem: (item: T) => void;
  onCreateItem: () => void;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
};

function GenericDropDown<T>({
  items,
  selectedItem,
  searchTerm,
  onSelectItem,
  onCreateItem,
  renderItem,
  keyExtractor,
}: GenericDropDownProps<T>) {
  if (items.length > 0 && !selectedItem) {
    return (
      <div className="absolute w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto z-10">
        {items.map((item) => (
          <div
            key={keyExtractor(item)}
            className="p-2 cursor-pointer hover:bg-gray-100"
            onClick={() => onSelectItem(item)}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    );
  }

  if (searchTerm && !selectedItem) {
    return (
      <div className="absolute w-full bg-white border border-gray-200 rounded shadow-lg z-10 flex items-center gap-2 mt-2 p-2">
        <p className="text-sm text-gray-600">{searchTerm}</p>
        <button
          className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          onClick={onCreateItem}
        >
          Crear
        </button>
      </div>
    );
  }

  return null;
}

export default GenericDropDown;