// src/components/SearchBar.tsx (ATUALIZADO)

import React, { useState } from "react";
import { FaFilter } from "react-icons/fa";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterClick?: () => void;
  showFilterIcon?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar...",
  onSearch,
  onFilterClick,
  showFilterIcon = true,
}) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className={styles.searchBarContainer} onSubmit={handleSubmit}>
      {/* NOVO: Wrapper para agrupar o input e o ícone */}
      <div className={styles.inputWrapper}>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className={styles.input}
        />
        {/* O ícone agora está DENTRO do wrapper, junto com o input */}
        {showFilterIcon && (
          <FaFilter className={styles.icon} onClick={onFilterClick} />
        )}
      </div>

      <button type="submit" className={styles.searchButton}>
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;
