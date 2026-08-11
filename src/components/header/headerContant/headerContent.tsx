import "./headerContent.css";
import { Link } from "react-router-dom";
import designerImg from "../../../shared/assets/Iss.png";
import { useTranslation } from "react-i18next";

export const HeaderContent = () => {
  const { t } = useTranslation();

  return (
    <div className="headerContent">
      <div className="mainSection">
        <div className="aboutIssContain">
          <span className="heroEyebrow">{t("header.subtitle")}</span>

          <h1 className="heroTitle">{t("header.hi")}</h1>
          <div className="heroUnderline" aria-hidden="true"></div>

          <p className="heroLead">{t("header.description")}</p>

          <div className="btnsContain">
            <Link className="btn large primary" to="/planetarium">
              {t("header.ctaPrimary")}
            </Link>
            <Link className="btn large secondary" to="/about">
              {t("header.ctaSecondary")}
            </Link>
          </div>
        </div>

        <img
          className="issLogo"
          src={designerImg}
          alt="International Space Station module"
          width={400}
          height={400}
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </div>
  );
};
