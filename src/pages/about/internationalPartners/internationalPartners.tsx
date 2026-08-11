import React from 'react';
import { useTranslation } from 'react-i18next';
import { Reveal } from '../../../shared/motion/Reveal';

export const InternationalPartners: React.FC = () => {
  const { t } = useTranslation();

  // Список партнёров остаётся здесь локально
  const partners = [
    { key: 'nasa', name: 'NASA', country: 'United States', role: 'Program management and major modules' },
    { key: 'roscosmos', name: 'Roscosmos', country: 'Russia', role: 'Core modules and crew transportation' },
    { key: 'esa', name: 'ESA', country: 'European Space Agency', role: 'Columbus laboratory and ATV' },
    { key: 'jaxa', name: 'JAXA', country: 'Japan', role: 'Kibo laboratory and HTV cargo' },
    { key: 'csa', name: 'CSA', country: 'Canada', role: 'Mobile Servicing System and robotics' }
  ];

  return (
    <section className="about-section">
      {/* Заголовок берём через i18 */}
      <h2>{t('partnersTitle', 'INTERNATIONAL PARTNERS')}</h2>
      <div className="partners-grid">
        {partners.map((partner, index) => (
          <Reveal key={partner.key} className="partner-card" delay={index * 60}>
            <h3>{t(`partners.${partner.key}.name`, partner.name)}</h3>
            <p className="country">{t(`partners.${partner.key}.country`, partner.country)}</p>
            <p className="role">{t(`partners.${partner.key}.role`, partner.role)}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
