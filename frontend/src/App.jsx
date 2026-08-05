import { useEffect } from "react";
import {
  Outlet,
  useLocation,
} from "react-router";

const HOME_URL = "https://jobtrace.fr/";

function App() {
  const location = useLocation();

  useEffect(function () {
    const isHomePage = location.pathname === "/";

    let robotsMeta = document.head.querySelector(
      "meta[name=\"robots\"]",
    );

    if (!robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      document.head.appendChild(robotsMeta);
    }

    let canonicalLink = document.head.querySelector(
      "link[rel=\"canonical\"]",
    );

    if (isHomePage) {
      robotsMeta.setAttribute(
        "content",
        "index, follow",
      );

      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }

      canonicalLink.setAttribute(
        "href",
        HOME_URL,
      );

      return;
    }

    robotsMeta.setAttribute(
      "content",
      "noindex, nofollow",
    );

    if (canonicalLink) {
      canonicalLink.remove();
    }
  }, [location.pathname]);

  return (
    <Outlet />
  );
}

export default App;
