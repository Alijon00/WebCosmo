import React from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../../../shared/motion/Reveal';

export const MissionVision: React.FC = () => {
  const { t } = useTranslation();

  const cards = [
    {
      key: 'mission',
      icon: '🚀',
      title: t('missionVision.mission.title', 'Our Mission'),
      description: t(
        'missionVision.mission.description',
        'The International Space Station serves as an unprecedented laboratory for scientific research and technological development in microgravity. It enables long-term human presence in space and serves as a stepping stone for future exploration missions to the Moon and Mars.'
      ),
    },
    {
      key: 'vision',
      icon: '🌍',
      title: t('missionVision.vision.title', 'Our Vision'),
      description: t(
        'missionVision.vision.description',
        'To maintain a continuous human presence in space for peaceful purposes, foster international cooperation, advance scientific knowledge, and inspire the next generation of explorers, scientists, and engineers worldwide.'
      ),
    },
  ];

  return (
    <section className="about-section">
      <h2>{t('missionVision.title', 'MISSION & VISION')}</h2>
      <div className="mission-content">
        {cards.map((card, i) => (
          <Reveal key={card.key} className="mission-card" delay={i * 90}>
            <h3>
              {card.icon} {card.title}
            </h3>
            <p>{card.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
