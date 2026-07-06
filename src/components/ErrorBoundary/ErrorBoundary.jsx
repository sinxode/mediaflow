import React, { Component } from 'react';
import { AlertOctagon } from 'lucide-react';
import Card from '../Card/Card';
import Button from '../Button/Button';
import { logger } from '../../utils/logger';
import styles from './ErrorBoundary.module.scss';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('ErrorBoundary caught unhandled render crash', error, errorInfo);
    
    // Auto-reload on lazy chunk load failure (stale index hashes on deployment updates)
    const isChunkError = 
      /failed to fetch dynamically imported module/i.test(error?.message) ||
      /importing a module script failed/i.test(error?.message) ||
      /loading chunk/i.test(error?.message);

    if (isChunkError) {
      console.warn('Dynamic asset/chunk 404 detected. Force-refreshing page to load latest build...');
      window.location.reload();
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.crashScreen}>
          <Card className={styles.errorCard}>
            <div className={styles.header}>
              <AlertOctagon className={styles.crashIcon} />
              <h2 className={styles.title}>Something went wrong</h2>
            </div>
            <p className={styles.description}>
              An unexpected application exception occurred. Please try reloading the workspace.
            </p>
            {this.state.error?.message && (
              <pre className={styles.stackTrace}>{this.state.error.message}</pre>
            )}
            <div className={styles.actions}>
              <Button variant="primary" size="md" onClick={this.handleReload}>
                Reload Application
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
