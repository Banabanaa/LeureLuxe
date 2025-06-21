import { Search } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface Props {
  onSearch: (value: string) => void;
}

const SearchBar = ({ onSearch }: Props) => {
  const [showInput, setShowInput] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when it's shown
  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  // Debounced search effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [value, onSearch]); // ✅ Include onSearch to satisfy exhaustive-deps

  return (
    <div className="relative flex items-center space-x-2">
      <button
        onClick={() => setShowInput(!showInput)}
        className="text-gray-600 hover:text-shop_light_green transition-colors"
      >
        <Search className="w-5 h-5 cursor-pointer" />
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          showInput ? "w-48 opacity-100 ml-2" : "w-0 opacity-0"
        }`}
      >
        <Input
          ref={inputRef}
          placeholder="Search..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-8 px-2 text-sm"
        />
      </div>
    </div>
  );
};

export default SearchBar;
