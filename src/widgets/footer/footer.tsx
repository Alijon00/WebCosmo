import "./footer.css";
import issLogo from "../../shared/assets/Iss.png";
import inIcon from "../../shared/assets/in.svg";
import twitterIcon from "../../shared/assets/twitter.svg";
import instagramIcon from "../../shared/assets/instagram.svg";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer>
      <div className="footerContain">
        <div className="topFooterContent">
          <div className="lightLogo">
            <img src={issLogo} alt="ISS logo" width={70} height={70} />
          </div>
          <div className="footerList">
            <p>{t("footer.styleGuide")}</p>
            <p>{t("footer.licence")}</p>
            <p>{t("footer.changelog")}</p>
          </div>
        </div>
        <div className="lowerFooterContent">
          <p>{t("footer.credit")}</p>
          <div className="networks">
            <img src={inIcon} alt="LinkedIn" width={24} height={24} />
            <img src={twitterIcon} alt="Twitter / X" width={24} height={24} />
            <img src={instagramIcon} alt="Instagram" width={24} height={24} />
          </div>
        </div>
      </div>
    </footer>
  );
};
