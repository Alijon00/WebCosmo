import React from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../../../shared/motion/Reveal';

export const AboutHeader: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { value: t('firstModuleYear', '1998'), label: t('firstModuleText', 'First Module Launched') },
    { value: t('astronautsVisited', '420+'), label: t('astronautsText', 'Astronauts Visited') },
    { value: t('partnerNations', '15'), label: t('partnerNationsText', 'Partner Nations') },
    { value: t('researchExperiments', '3000+'), label: t('researchExperimentsText', 'Research Experiments') },
  ];

  return (
    <section className="about-section">
      <div className="section-content">
        <h1>{t('aboutTitle', 'ABOUT ISS')}</h1>
        <p className="subtitle">{t('aboutSubtitle', '25 Years of International Cooperation in Space')}</p>

        <div className="stats-grid">
          {stats.map((s, i) => (
            <Reveal key={i} className="stat" delay={i * 60}>
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
