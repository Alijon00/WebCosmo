// @ts-nocheck
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "../src/i18n";
import { Navbar } from "../src/widgets/navbar/nav";
import { Footer } from "../src/widgets/footer/footer";
import { HeaderContent } from "../src/components/header/headerContant/headerContent";
import { Home } from "../src/pages/home/home";
import { About } from "../src/pages/about/about";
import { Gallery } from "../src/pages/gallery/gallery";
import { Planetarium } from "../src/pages/planetarium/planetarium";

function render(node: React.ReactElement, route = "/") {
  return renderToStaticMarkup(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[route]}>{node}</MemoryRouter>
    </I18nextProvider>
  );
}

async function main() {
  const arg = process.argv[2] || "nav";
  const lang = process.argv[3] || "en";
  const route = process.argv[4] || "/";
  await i18n.changeLanguage(lang);

  const map: Record<string, React.ReactElement> = {
    nav: <Navbar />,
    footer: <Footer />,
    hero: <HeaderContent />,
    home: <Home />,
    about: <About />,
    gallery: <Gallery />,
    planetarium: <Planetarium />,
  };
  const html = render(map[arg] ?? <Navbar />, route);
  console.log(html.replace(/></g, ">\n<"));
}

main();
