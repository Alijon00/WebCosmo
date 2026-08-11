import React from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../../../shared/motion/Reveal';

export const FuturePlans: React.FC = () => {
  const { t } = useTranslation();

  const plans = t('futurePlansList', { returnObjects: true }) as {
    icon: string;
    title: string;
    description: string;
  }[];

  return (
    <section className="about-section">
      <h2>{t('futurePlansTitle', 'FUTURE OF ISS')}</h2>
      <div className="future-content">
        {plans.map((plan, index) => (
          <Reveal key={index} className="future-plan" delay={index * 60}>
            <h3>{plan.icon} {plan.title}</h3>
            <p>{plan.description}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
