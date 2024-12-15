import React, { useState } from "react";
import styles from "./ModalFilter.module.css";

interface SelectOption {
  label: string;
  value: string;
}

interface ModalProps {
  searchPlaceholder: string;
  filterOptions: {
    department: SelectOption[];
    family: SelectOption[];
    group: SelectOption[];
    subgroup: SelectOption[];
  };
  datePlaceholders: {
    start: string;
    end: string;
  };
  onClose: () => void; // Callback para fechar o modal
}

const ModalFilter: React.FC<ModalProps> = ({
  searchPlaceholder,
  filterOptions,
  datePlaceholders,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    family: "",
    group: "",
    subgroup: "",
  });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: string
  ) => {
    if (field === "start" || field === "end") {
      setDateRange({ ...dateRange, [field]: e.target.value });
    } else {
      setFilters({ ...filters, [field]: e.target.value });
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()} // Evita que o clique feche o modal ao interagir com o conteúdo
      >
        <div className={styles.fieldGroup}>
          <label>Buscar por:</label>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Filtrar por:</label>
          <select
            value={filters.department}
            onChange={(e) => handleInputChange(e, "department")}
            className={styles.select}
          >
            <option value="">Departamento</option>
            {filterOptions.department.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={filters.family}
            onChange={(e) => handleInputChange(e, "family")}
            className={styles.select}
          >
            <option value="">Família</option>
            {filterOptions.family.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={filters.group}
            onChange={(e) => handleInputChange(e, "group")}
            className={styles.select}
          >
            <option value="">Grupo</option>
            {filterOptions.group.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={filters.subgroup}
            onChange={(e) => handleInputChange(e, "subgroup")}
            className={styles.select}
          >
            <option value="">Subgrupo</option>
            {filterOptions.subgroup.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label>Data Início Promoção</label>
          <input
            type="date"
            placeholder={datePlaceholders.start}
            value={dateRange.start}
            onChange={(e) => handleInputChange(e, "start")}
            className={styles.input}
          />
          <label>Data Fim Promoção</label>
          <input
            type="date"
            placeholder={datePlaceholders.end}
            value={dateRange.end}
            onChange={(e) => handleInputChange(e, "end")}
            className={styles.input}
          />
        </div>
      </div>
    </div>
  );
};

export default ModalFilter;