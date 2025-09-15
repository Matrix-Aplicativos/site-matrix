import React, { useState } from "react";
import { FaFilter } from "react-icons/fa";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onFilterClick?: () => void;
  showFilterIcon?: boolean; // <-- Nova propriedade adicionada
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar...",
  onSearch,
  onFilterClick,
  showFilterIcon = true, // <-- Valor padrão 'true' para não quebrar em outras telas
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
      {/* O ícone só será renderizado se showFilterIcon for true */}
      {showFilterIcon && (
        <FaFilter className={styles.icon} onClick={onFilterClick} />
      )}
    </div>
  );
};

export default SearchBar;
