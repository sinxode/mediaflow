import React from 'react';
import { Search } from 'lucide-react';
import styles from './ArchiveFilters.module.scss';

const ArchiveFilters = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  userFilter,
  setUserFilter,
  statusFilter,
  setStatusFilter,
  categories = []
}) => {
  return (
    <div className={styles.filtersBar}>
      {/* Search Input */}
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search published content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Select Dropdowns Scroll Area */}
      <div className={styles.selectsScroll}>
        <div className={styles.selectsContainer}>
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.select}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Published By */}
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className={styles.select}
          >
            <option value="">Published By</option>
            <option value="Ameen">Ameen</option>
            <option value="Sinan">Sinan</option>
          </select>

          {/* Completion Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option value="">Archive Status</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ArchiveFilters;
