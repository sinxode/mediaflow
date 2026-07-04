import React from 'react';
import { Cpu, Terminal, Compass } from 'lucide-react';
import Card from '../../../components/Card/Card';
import styles from './AboutCard.module.scss';

const AboutCard = () => {
  return (
    <Card padding={true} className={styles.aboutCard}>
      <h3 className={styles.sectionTitle}>About Application</h3>
      
      <div className={styles.heroRow}>
        <div className={styles.logoBox}>MF</div>
        <div className={styles.heroText}>
          <span className={styles.appName}>MediaFlow Platform</span>
          <span className={styles.subtitle}>Phase 1 Content Release Candidate</span>
        </div>
      </div>

      <div className={styles.specsGrid}>
        <div className={styles.specItem}>
          <Terminal className={styles.specIcon} />
          <div className={styles.specMeta}>
            <span className={styles.label}>Software Version</span>
            <span className={styles.value}>v1.0.0-beta</span>
          </div>
        </div>
        <div className={styles.specItem}>
          <Cpu className={styles.specIcon} />
          <div className={styles.specMeta}>
            <span className={styles.label}>Build Index</span>
            <span className={styles.value}>b284.agy-agent</span>
          </div>
        </div>
        <div className={styles.specItem}>
          <Compass className={styles.specIcon} />
          <div className={styles.specMeta}>
            <span className={styles.label}>Platform Core</span>
            <span className={styles.value}>Capacitor Shell Native</span>
          </div>
        </div>
      </div>

      <div className={styles.creditsSection}>
        <span className={styles.creditsLabel}>Design & Engineering</span>
        <p className={styles.creditsText}>
          Designed, engineered, and developed by{' '}
          <a
            href="https://sinxode.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.nameLink}
          >
            Muhammad Sinan
          </a>
          , a Full Stack Developer specializing in high-performance web systems, modern styling, and scalable real-time integrations.
        </p>
      </div>
    </Card>
  );
};

export default AboutCard;
