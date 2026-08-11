import React from 'react';
import { useTranslation } from 'react-i18next';

export const Timeline: React.FC = () => {
  const { t } = useTranslation();

  const milestones = [
    { 
      year: '1998', 
      event: t('timeline.1998.event', 'First module Zarya launched'), 
      detail: t('timeline.1998.detail', 'Beginning of ISS assembly') 
    },
    { 
      year: '2000', 
      event: t('timeline.2000.event', 'First expedition crew'), 
      detail: t('timeline.2000.detail', 'Continuous human presence begins') 
    },
    { 
      year: '2008', 
      event: t('timeline.2008.event', 'Columbus laboratory added'), 
      detail: t('timeline.2008.detail', 'ESA joins permanent research') 
    },
    { 
      year: '2011', 
      event: t('timeline.2011.event', 'Final shuttle mission'), 
      detail: t('timeline.2011.detail', 'Completion of US assembly') 
    },
    { 
      year: '2020', 
      event: t('timeline.2020.event', 'Commercial Crew Program'), 
      detail: t('timeline.2020.detail', 'New era of space transportation') 
    },
    { 
      year: '2023', 
      event: t('timeline.2023.event', '25 years in orbit'), 
      detail: t('timeline.2023.detail', 'Celebrating quarter century') 
    }
  ];

  return (
    <section className="about-section animate-section">
      <h2>{t('timeline.title', 'HISTORICAL TIMELINE')}</h2>
      <div className="timeline">
        {milestones.map((milestone, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-year">{milestone.year}</div>
            <div className="timeline-content">
              <h4>{milestone.event}</h4>
              <p>{milestone.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};