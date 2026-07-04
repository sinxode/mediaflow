import React from 'react';
import styles from './PageHeader.module.scss';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PageHeader = ({
  title,
  description,
  actions = null,
  breadcrumbs = [],
  className = '',
  ...props
}) => {
  return (
    <div className={`${styles.header} ${className}`} {...props}>
      <div className={styles.infoWrapper}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.label}>
                  {index > 0 && (
                    <span className={styles.separator} aria-hidden="true">
                      <ChevronRight />
                    </span>
                  )}
                  {isLast ? (
                    <span className={styles.current}>{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className={styles.link}>
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}
        
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
      
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
};

export default PageHeader;
