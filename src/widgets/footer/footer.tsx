import "./footer.css";
import issLogo from "../../shared/assets/Iss.png";
import inIcon from "../../shared/assets/in.svg";
import twitterIcon from "../../shared/assets/twitter.svg";
import instagramIcon from "../../shared/assets/instagram.svg";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SITE_LINKS = [
  { to: "/", key: "Home" },
  { to: "/about", key: "About" },
  { to: "/gallery", key: "Gallery" },
  { to: "/planetarium", key: "Planetarium" },
];

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="siteFooter">
      <div className="footerGrid">
        <div className="footerBrand">
          <div className="footerLogo">
            <img src={issLogo} alt="ISS logo" width={40} height={40} />
            <span>ISS</span>
          </div>
          <p className="footerTagline">{t("footer.tagline")}</p>
        </div>

        <nav className="footerCol" aria-label={t("footer.explore")}>
          <h4 className="footerHeading">{t("footer.explore")}</h4>
          {SITE_LINKS.map((l) => (
            <Link key={l.to} className="footerLink" to={l.to}>
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="footerCol">
          <h4 className="footerHeading">{t("footer.data")}</h4>
          <a className="footerLink" href="https://wheretheiss.at" target="_blank" rel="noreferrer">
            {t("footer.wheretheiss")}
          </a>
          <a
            className="footerLink"
            href="https://www.nasa.gov/multimedia/imagegallery/"
            target="_blank"
            rel="noreferrer"
          >
            {t("footer.nasa")}
          </a>
        </div>

        <div className="footerCol">
          <h4 className="footerHeading">{t("footer.connect")}</h4>
          <div className="footerSocial">
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <img src={inIcon} alt="" width={22} height={22} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter / X">
              <img src={twitterIcon} alt="" width={22} height={22} />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <img src={instagramIcon} alt="" width={22} height={22} />
            </a>
          </div>
        </div>
      </div>

      <div className="footerBottom">
        <span>{t("footer.credit")}</span>
        <span className="footerOlympiad">{t("footer.olympiad")}</span>
      </div>
    </footer>
  );
};
