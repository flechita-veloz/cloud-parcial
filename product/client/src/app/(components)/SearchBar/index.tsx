// ClientSearchBar.tsx
import {SearchIcon, XCircle} from "lucide-react";
type Props = {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  onClear?: () => void;
  children?: React.ReactNode;
  placeholder?: string;
  widthFull?: boolean;
};

const SearchBar = ({ value, onChange, disabled, onClear, children, placeholder, widthFull }: Props) => (
  <>
    {/* Desktop */}
    <div className="hidden md:flex flex-row items-center border-2 border-gray-200 rounded-lg w-full">
      
      <div className={widthFull ? "relative flex-1" : "relative w-3/5"}>
        <SearchIcon className="w-5 h-5 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
        <input
          className="w-full py-2 pl-9 pr-10 rounded bg-white"
          placeholder={placeholder || "Buscar elemento"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        {disabled && onClear && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={onClear}
          >
            <XCircle className="w-6 h-6 hover:text-blue-500" />
          </button>
        )}
      </div>
      {children && (
        <div className={widthFull ? "flex items-center min-w-0 flex-1" : "flex items-center min-w-0 w-2/5"} >
          {children}
        </div>
      )}
    </div>

    {/* Tablet / Mobile */}
    <div className="flex flex-col md:hidden w-full gap-2">
      <div className="flex items-center border-2 border-gray-200 rounded-lg w-full">
        <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
        <div className="relative w-full">
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder={placeholder || "Buscar elemento"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
          {disabled && onClear && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={onClear}
            >
              <XCircle className="w-6 h-6 hover:text-blue-500" />
            </button>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center border-2 border-gray-200 rounded-lg w-full">
          {children}
        </div>
      )}
    </div>
  </>
);

export default SearchBar;