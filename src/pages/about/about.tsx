import React from "react";
import './about.css';
import { AboutHeader } from "./aboutHeader/aboutHeader";
import { MissionVision } from "./missionVision/missionVision";
import { Timeline } from "./timeLine/timeLine";
import { Achievements } from "./achievements/achievements";
import { InternationalPartners } from "./internationalPartners/internationalPartners";
import { FuturePlans } from "./futurePlans/futurePlans";

export const About: React.FC = () => {
  return (
    <div className="about-container">
      <AboutHeader />
      <MissionVision />
      <Timeline />
      <Achievements />
      <InternationalPartners />
      <FuturePlans />
    </div>
  );
};
