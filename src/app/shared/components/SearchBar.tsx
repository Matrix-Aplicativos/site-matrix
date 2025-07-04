import React, { useEffect, useState } from "react";
import { FaFilter } from "react-icons/fa";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterClick?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar...",
  onSearch,
  onFilterClick,
}) => {
  const [query, setQuery] = useState("");


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className={styles.searchBarContainer}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        className={styles.input}
      />
      <FaFilter
        className={styles.icon}
        onClick={onFilterClick} 
      />
      
    </div>
  );
};

export default SearchBar;
