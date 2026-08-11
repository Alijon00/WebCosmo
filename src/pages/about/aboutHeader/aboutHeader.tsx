import React from 'react';
import { useTranslation } from 'react-i18next';

export const AboutHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="about-section animate-section">
      <div className="section-content">
        <h1>{t('aboutTitle', 'ABOUT ISS')}</h1>
        <p className="subtitle">{t('aboutSubtitle', '25 Years of International Cooperation in Space')}</p>

        <div className="stats-grid">
          <div className="stat">
            <h3>{t('firstModuleYear', '1998')}</h3>
            <p>{t('firstModuleText', 'First Module Launched')}</p>
          </div>
          <div className="stat">
            <h3>{t('astronautsVisited', '420+')}</h3>
            <p>{t('astronautsText', 'Astronauts Visited')}</p>
          </div>
          <div className="stat">
            <h3>{t('partnerNations', '15')}</h3>
            <p>{t('partnerNationsText', 'Partner Nations')}</p>
          </div>
          <div className="stat">
            <h3>{t('researchExperiments', '3000+')}</h3>
            <p>{t('researchExperimentsText', 'Research Experiments')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
