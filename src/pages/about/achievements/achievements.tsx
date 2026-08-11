import React from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../../../shared/motion/Reveal';

export const Achievements: React.FC = () => {
  const { t } = useTranslation();

  const achievements = t('achievementsList', { returnObjects: true }) as {
    icon: string;
    title: string;
    description: string;
  }[];

  return (
    <section className="about-section">
      <h2>{t('achievementsTitle')}</h2>
      <div className="achievements-grid">
        {achievements.map((achievement, index) => (
          <Reveal key={index} className="achievement-card" delay={index * 60}>
            <div className="achievement-icon">{achievement.icon}</div>
            <h3>{achievement.title}</h3>
            <p>{achievement.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
