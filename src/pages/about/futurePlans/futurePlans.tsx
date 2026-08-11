import React from 'react';
import { useTranslation } from 'react-i18next';

export const FuturePlans: React.FC = () => {
  const { t } = useTranslation();

  const plans = t('futurePlansList', { returnObjects: true }) as {
    icon: string;
    title: string;
    description: string;
  }[];

  return (
    <section className="about-section animate-section">
      <h2>{t('futurePlansTitle', 'FUTURE OF ISS')}</h2>
      <div className="future-content">
        {plans.map((plan, index) => (
          <div key={index} className="future-plan">
            <h3>{plan.icon} {plan.title}</h3>
            <p>{plan.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
