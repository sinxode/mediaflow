import React from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import Button from '../../../../components/Button/Button';
import styles from './TaskFilters.module.scss';

const TaskFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  userFilter,
  setUserFilter,
  categories = [],
  statuses = [],
  priorities = [],
  users = [],
  onlyMyTasks,
  setOnlyMyTasks,
  onResetFilters
}) => {
  return (
    <div className={styles.stickyFilterContainer}>
      <div className={styles.filterRow}>
        {/* Search Field */}
        <div className={styles.searchField}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Filters Scroll Container */}
        <div className={styles.filtersScroll}>
          <div className={styles.filtersList}>
            {/* My Tasks Toggle */}
            <button
              type="button"
              className={`${styles.myTasksBtn} ${onlyMyTasks ? styles.active : ''}`}
              onClick={() => setOnlyMyTasks(!onlyMyTasks)}
            >
              My Tasks
            </button>

            {/* Category Filter */}
            <div className={styles.selectWrapper}>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className={styles.selectWrapper}>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">All Statuses</option>
                {statuses.map((stat) => (
                  <option key={stat} value={stat.toLowerCase()}>{stat}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className={styles.selectWrapper}>
              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">All Priorities</option>
                {priorities.map((prio) => (
                  <option key={prio} value={prio.toLowerCase()}>{prio}</option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div className={styles.selectWrapper}>
              <select
                id="user-filter"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">All Assignees</option>
                {users.map((usr) => (
                  <option key={usr} value={usr}>{usr}</option>
                ))}
              </select>
            </div>
            
            {/* Reset Button */}
            {(searchQuery || statusFilter || priorityFilter || categoryFilter || userFilter || onlyMyTasks) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className={styles.resetButton}
                leftIcon={<RotateCcw />}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
