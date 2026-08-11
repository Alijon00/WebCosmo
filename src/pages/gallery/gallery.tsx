import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './gallery.css';
import astronaut1 from "../../shared/assets/astro1.jpg"
import astronaut2 from "../../shared/assets/astro2.jpeg"
import astronaut3 from "../../shared/assets/astro3.jpeg"
import astronaut4 from "../../shared/assets/astro4.jpg"
import astronaut5 from "../../shared/assets/astro5.jpeg"
import astronaut6 from "../../shared/assets/astro6.jpg"
import astronaut7 from "../../shared/assets/astro7.jpg"
import astronaut8 from "../../shared/assets/astro8.jpg"
import astronaut9 from "../../shared/assets/astro9.jpg"
import stat1 from "../../shared/assets/stat1.jpg"
import stat2 from "../../shared/assets/stat2.webp"
import stat3 from "../../shared/assets/stat3.jpg"
import stat4 from "../../shared/assets/stat4.jpg"
import stat5 from "../../shared/assets/stat5.jpg"
import stat6 from "../../shared/assets/stat6.jpg"
import stat7 from "../../shared/assets/stat7.jpg"
import stat8 from "../../shared/assets/stat8.jpg"
import stat9 from "../../shared/assets/stat9.jpg"
import sce1 from "../../shared/assets/sce1.jpg"
import sce2 from "../../shared/assets/sce2.jpg"
import sce3 from "../../shared/assets/sce3.jpg"
import sce4 from "../../shared/assets/sce4.jpg"
import sce5 from "../../shared/assets/sce5.jpg"
import sce6 from "../../shared/assets/sce6.jpg"
import sce7 from "../../shared/assets/sce7.jpg"
import sce8 from "../../shared/assets/sce8.jpg"
import sce9 from "../../shared/assets/sce9.jpg" 
import earth1 from "../../shared/assets/earth1.jpg"
import earth2 from "../../shared/assets/earth2.jpg"
import earth3 from "../../shared/assets/earth3.jpg"
import earth4 from "../../shared/assets/earth4.jpg"
import earth5 from "../../shared/assets/earth5.jpg"
import earth6 from "../../shared/assets/earth6.webp"

interface GalleryImage {
  id: string;
  title: string;
  url: string;
  description: string;
  category: 'all' | 'station' | 'astronauts' | 'science' | 'earth';
  year: string;
  credit: string;
}

export const Gallery: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'station' | 'astronauts' | 'science' | 'earth'>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const categories = [
    { id: 'all', label: t('gallery.categories.all', 'All') },
    { id: 'station', label: t('gallery.categories.station', 'Station') },
    { id: 'astronauts', label: t('gallery.categories.astronauts', 'Astronauts') },
    { id: 'science', label: t('gallery.categories.science', 'Science') },
    { id: 'earth', label: t('gallery.categories.earth', 'Earth') }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const openModal = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h1>{t('gallery.title', 'ISS GALLERY')}</h1>
        <p>{t('gallery.subtitle', '25 Years of International Space Station')}</p>
        <div className="gallery-subtitle">
          <span>{t('gallery.subtitle1', 'ISS MK D')}</span>
          <span>{t('gallery.subtitle2', '1998 - 2023')}</span>
          <span>{t('gallery.subtitle3', 'INTERNATIONAL COOPERATION')}</span>
        </div>
      </div>

      <div className="filter-buttons">
        {categories.map(category => (
          <button
            key={category.id}
            className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id as any)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filteredImages.map((image) => (
          <div 
            key={image.id} 
            className="gallery-item"
            onClick={() => openModal(image)}
          >
            <img
              src={image.url}
              alt={image.title}
              loading="lazy"
              decoding="async"
            />
            <div className="image-overlay">
              <h3>{image.title}</h3>
              <span>{image.year} • {image.category.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>×</button>
            <img src={selectedImage.url} alt={selectedImage.title} />
            <div className="modal-info">
              <h2>{selectedImage.title}</h2>
              <p className="date">{selectedImage.year} • {selectedImage.category.toUpperCase()}</p>
              <p className="description">{selectedImage.description}</p>
              <div className="source-info">
                <span>{t('gallery.credit', 'Credit')}: {selectedImage.credit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="gallery-footer">
        <p>{t('gallery.footer', 'International Space Station • 25 Years of Discovery')}</p>
      </div>
    </div>
  );
};

const galleryImages: GalleryImage[] = [
  {
    id: "1",
    title: "Spacewalk Preparation",
    url: astronaut1,
    description: "Astronaut preparing for extravehicular activity in the Quest airlock. Spacewalks require 6-8 hours of preparation with specialized EMU suits.",
    category: "astronauts",
    year: "2021",
    credit: "NASA"
  },
  {
    id: "2",
    title: "Microgravity Training",
    url: astronaut2,
    description: "Astronaut conducting emergency procedures training in simulated microgravity conditions aboard the station.",
    category: "astronauts",
    year: "2019",
    credit: "NASA"
  },
  {
    id: "3",
    title: "Morning Conference",
    url: astronaut3,
    description: "International crew members participating in daily planning conference with mission control centers around the world.",
    category: "astronauts",
    year: "2020",
    credit: "NASA/ROSCOSMOS"
  },
  {
    id: "4",
    title: "Medical Check-up",
    url: astronaut4,
    description: "Routine health monitoring in the Human Research Facility to study effects of long-duration spaceflight on the human body.",
    category: "astronauts",
    year: "2018",
    credit: "NASA/ESA"
  },
  {
    id: "5",
    title: "Floating in Node Module",
    url: astronaut5,
    description: "Astronaut moving through the Harmony node module, demonstrating daily life in microgravity environment.",
    category: "astronauts",
    year: "2022",
    credit: "NASA"
  },
  {
    id: "6",
    title: "International Crew Meal",
    url: astronaut6,
    description: "Crew members from different space agencies sharing a meal in the Unity module's galley area.",
    category: "astronauts",
    year: "2020",
    credit: "NASA"
  },
  {
    id: "7",
    title: "Exercise Routine",
    url: astronaut7,
    description: "Daily exercise on the Advanced Resistive Exercise Device (ARED) to maintain bone density and muscle strength.",
    category: "astronauts",
    year: "2019",
    credit: "NASA"
  },
  {
    id: "8",
    title: "Earth Observation",
    url: astronaut8,
    description: "Astronaut documenting Earth phenomena from the Cupola observation module for scientific research.",
    category: "astronauts",
    year: "2021",
    credit: "ESA/NASA"
  },
  {
    id: "9",
    title: "Maintenance Work",
    url: astronaut9,
    description: "Crew member performing routine maintenance on life support systems in the Destiny laboratory.",
    category: "astronauts",
    year: "2017",
    credit: "NASA"
  },
  {
    id: "10",
    title: "Cupola Observation Module",
    url: stat1,
    description: "The European-built Cupola module with its seven windows provides 360-degree views for Earth observation and robotic operations.",
    category: "station",
    year: "2016",
    credit: "ESA/NASA"
  },
  {
    id: "11",
    title: "Columbus Laboratory",
    url: stat2,
    description: "ESA's Columbus laboratory module, Europe's largest contribution to the ISS, hosting numerous scientific experiments.",
    category: "station",
    year: "2018",
    credit: "ESA"
  },
  {
    id: "12",
    title: "Kibo Laboratory Exterior",
    url: stat3,
    description: "JAXA's Kibo laboratory module with its exposed facility for space environment experiments.",
    category: "station",
    year: "2015",
    credit: "JAXA/NASA"
  },
  {
    id: "13",
    title: "Solar Array Wings",
    url: stat4,
    description: "One of eight massive solar array wings that convert sunlight into 120 kW of electrical power for the station.",
    category: "station",
    year: "2019",
    credit: "NASA"
  },
  {
    id: "14",
    title: "Russian Segment",
    url: stat5,
    description: "The Russian Orbital Segment including Zvezda service module and Zarya functional cargo block.",
    category: "station",
    year: "2017",
    credit: "ROSCOSMOS"
  },
  {
    id: "15",
    title: "Truss Structure",
    url: stat6,
    description: "The integrated truss structure that forms the backbone of the station, supporting solar arrays and radiators.",
    category: "station",
    year: "2014",
    credit: "NASA"
  },
  {
    id: "16",
    title: "Docking Ports",
    url: stat7,
    description: "International Docking Adapters allowing commercial crew vehicles like SpaceX Dragon and Boeing Starliner to dock.",
    category: "station",
    year: "2020",
    credit: "NASA"
  },
  {
    id: "17",
    title: "Radiator Panels",
    url: stat8,
    description: "Thermal control system radiators that reject excess heat from station systems into space.",
    category: "station",
    year: "2018",
    credit: "NASA"
  },
  {
    id: "18",
    title: "Station Configuration",
    url: stat9,
    description: "Complete ISS configuration showing all major modules and truss elements in orbital orientation.",
    category: "station",
    year: "2021",
    credit: "NASA"
  },
  {
    id: "19",
    title: "Fluid Physics Research",
    url: sce1,
    description: "The Fluid Science Laboratory studying complex fluid behavior in microgravity for materials science applications.",
    category: "science",
    year: "2019",
    credit: "ESA/NASA"
  },
  {
    id: "20",
    title: "Plant Habitat Growth",
    url: sce2,
    description: "Advanced Plant Habitat conducting experiments on growing crops in space for future long-duration missions.",
    category: "science",
    year: "2020",
    credit: "NASA"
  },
  {
    id: "21",
    title: "Materials Science",
    url: sce3,
    description: "Materials Science Laboratory investigating new alloy compositions and manufacturing techniques in space.",
    category: "science",
    year: "2018",
    credit: "NASA"
  },
  {
    id: "22",
    title: "Cold Atom Lab",
    url: sce4,
    description: "The Cold Atom Laboratory studying quantum phenomena at temperatures near absolute zero.",
    category: "science",
    year: "2021",
    credit: "NASA/JPL"
  },
  {
    id: "23",
    title: "Biomedical Research",
    url: sce5,
    description: "Life Science Glovebox supporting biological experiments on cells, tissues, and small organisms.",
    category: "science",
    year: "2019",
    credit: "NASA"
  },
  {
    id: "24",
    title: "Combustion Research",
    url: sce6,
    description: "The Combustion Integrated Rack studying fire behavior and combustion processes in microgravity.",
    category: "science",
    year: "2017",
    credit: "NASA"
  },
  {
    id: "25",
    title: "Protein Crystal Growth",
    url: sce7,
    description: "Commercial Protein Crystal Growth experiments for pharmaceutical research and drug development.",
    category: "science",
    year: "2020",
    credit: "NASA/CASIS"
  },
  {
    id: "26",
    title: "Earth Science Monitoring",
    url: sce8,
    description: "Instruments monitoring climate change, weather patterns, and environmental phenomena from orbit.",
    category: "science",
    year: "2022",
    credit: "NASA/NOAA"
  },
  {
    id: "27",
    title: "Radiation Studies",
    url: sce9,
    description: "Radiation monitoring equipment collecting data on cosmic rays and solar particle events.",
    category: "science",
    year: "2018",
    credit: "NASA/ESA"
  },
  {
    id: "28",
    title: "Caribbean Waters",
    url: earth1,
    description: "Crystal-clear waters of the Caribbean Sea showing coral reefs and underwater topography from orbit.",
    category: "earth",
    year: "2021",
    credit: "NASA"
  },
  {
    id: "29",
    title: "Himalayan Mountains",
    url: earth2,
    description: "The majestic Himalayan mountain range with Mount Everest visible, as seen from 400 km altitude.",
    category: "earth",
    year: "2019",
    credit: "NASA"
  },
  {
    id: "30",
    title: "Aurora Australis",
    url: earth3,
    description: "Southern Lights dancing over the Antarctic region during a geomagnetic storm.",
    category: "earth",
    year: "2020",
    credit: "NASA"
  },
  {
    id: "31",
    title: "African Desert",
    url: earth4,
    description: "The vast Sahara Desert with its intricate patterns of sand dunes and dry river beds.",
    category: "earth",
    year: "2018",
    credit: "NASA"
  },
  {
    id: "32",
    title: "City Lights at Night",
    url: earth5,
    description: "Major metropolitan areas illuminated at night, showing human population distribution patterns.",
    category: "earth",
    year: "2022",
    credit: "NASA"
  },
  {
    id: "33",
    title: "Pacific Ocean Storms",
    url: earth6,
    description: "Tropical storm systems developing over the warm waters of the Pacific Ocean.",
    category: "earth",
    year: "2019",
    credit: "NASA/NOAA"
  }
];