import React, { useState } from "react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Buscar...", onSearch }) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        className={styles.input}
      />
      <button onClick={handleSearch} className={styles.button}>
        Buscar
      </button>
    </div>
  );
};

export default SearchBar;
