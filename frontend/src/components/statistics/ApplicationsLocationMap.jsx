import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { buildApplicationsLocationMapData } from "../../utils/statistics/locationMap.utils";

const FRANCE_CENTER = [46.2276, 2.2137];
const DEFAULT_ZOOM = 5;
const LOCATION_FOCUS_ZOOM = 9;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPopupHtml(location) {
  const applicationItems = location.applications
    .slice(0, 5)
    .map(function (application) {
      return "<li>" + escapeHtml(application.label) + "</li>";
    })
    .join("");

  let extraText = "";

  if (location.applications.length > 5) {
    extraText = "<p style=\"margin-top: 8px; font-size: 12px; opacity: 0.7;\">+" + String(location.applications.length - 5) + " autre(s) candidature(s)</p>";
  }

  return [
    "<div style=\"max-width: 260px;\">",
    "<p style=\"font-weight: 700; margin: 0;\">" + escapeHtml(location.city) + "</p>",
    "<p style=\"font-size: 13px; margin: 4px 0 0;\">" + String(location.count) + " candidature(s)</p>",
    "<ul style=\"margin: 8px 0 0; padding-left: 18px; font-size: 12px;\">",
    applicationItems,
    "</ul>",
    extraText,
    "</div>",
  ].join("");
}

function createLocationIcon(location) {
  return L.divIcon({
    className: "",
    html: "<div class=\"w-10 h-10 flex flex-row justify-center items-center text-sm font-black text-primary-content rounded-full bg-primary shadow-sm\">" + String(location.count) + "</div>",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}

function getMapBounds(locations) {
  const bounds = [];

  locations.forEach(function (location) {
    bounds.push([location.latitude, location.longitude]);
  });

  return bounds;
}

function EmptyLocationsCard() {
  return (
    <div className="w-full min-w-0 p-4 text-center rounded-xl bg-base-200">
      <h3 className="font-semibold text-base-content">
        Aucune ville reconnue
      </h3>

      <p className="mt-1 text-sm text-base-content/60">
        Les localisations reconnues apparaîtront ici.
      </p>
    </div>
  );
}

function LocationItem({ location, onFocusLocation }) {
  return (
    <button
      className="w-full min-w-0 p-4 flex flex-row justify-between items-center gap-4 text-left rounded-xl bg-base-200 hover:bg-base-300 cursor-pointer"
      type="button"
      onClick={function () { onFocusLocation(location); }}
    >
      <div className="min-w-0">
        <h3 className="font-semibold text-base-content truncate">
          {location.city}
        </h3>

        <p className="mt-1 text-sm text-base-content/60 truncate">
          {location.count} candidature(s)
        </p>
      </div>

      <span className="w-10 h-10 shrink-0 flex flex-row justify-center items-center text-sm font-black text-primary-content rounded-full bg-primary">
        {location.count}
      </span>
    </button>
  );
}

function ApplicationsLocationMap({ applications }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);

  const mappedLocations = useMemo(function () {
    return buildApplicationsLocationMapData(applications);
  }, [applications]);

  const topMappedLocations = mappedLocations.slice(0, 5);

  const resetMapView = useCallback(function () {
    if (!mapRef.current) {
      return;
    }

    if (mappedLocations.length === 0) {
      mapRef.current.setView(FRANCE_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (mappedLocations.length === 1) {
      const location = mappedLocations[0];
      mapRef.current.setView([location.latitude, location.longitude], DEFAULT_ZOOM);
      return;
    }

    const bounds = getMapBounds(mappedLocations);

    mapRef.current.fitBounds(bounds, {
      padding: [32, 32],
      maxZoom: DEFAULT_ZOOM,
    });
  }, [mappedLocations]);

  useEffect(function () {
    if (!mapContainerRef.current) {
      return undefined;
    }

    if (mapRef.current) {
      return undefined;
    }

    mapRef.current = L.map(mapContainerRef.current, {
      center: FRANCE_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
      wheelDebounceTime: 40,
      wheelPxPerZoomLevel: 80,
      attributionControl: true,
    });

    mapRef.current.attributionControl.setPrefix(false);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
      detectRetina: true,
    }).addTo(mapRef.current);

    markerLayerRef.current = L.layerGroup().addTo(mapRef.current);

    window.setTimeout(function () {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 0);

    return function cleanup() {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerLayerRef.current = null;
      }
    };
  }, []);

  useEffect(function () {
    if (!mapRef.current || !markerLayerRef.current) {
      return;
    }

    markerLayerRef.current.clearLayers();

    mappedLocations.forEach(function (location) {
      const marker = L.marker([location.latitude, location.longitude], {
        icon: createLocationIcon(location),
      }).bindPopup(getPopupHtml(location));

      marker.addTo(markerLayerRef.current);
    });

    resetMapView();
  }, [mappedLocations, resetMapView]);

  function focusLocation(location) {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.flyTo([location.latitude, location.longitude], LOCATION_FOCUS_ZOOM);
  }

  return (
    <div className="w-full min-w-0 p-4 md:p-6 rounded-2xl bg-base-100 shadow-sm">
      <div className="w-full flex flex-row justify-between items-start gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-base-content">
            Carte des candidatures
          </h2>

          <p className="mt-1 text-sm text-base-content/60">
            Visualisation des villes reconnues à partir des localisations renseignées.
          </p>
        </div>

        <span className="badge badge-primary shrink-0 text-primary-content">
          {mappedLocations.length} ville(s)
        </span>
      </div>

      <div className="w-full mt-6 grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] justify-start items-start gap-6">
        <div className="relative w-full h-[360px] md:h-[420px] xl:h-[430px] rounded-xl border border-base-300 bg-base-200 overflow-hidden">
          <button
            className="btn btn-sm btn-primary absolute bottom-4 left-4 flex flex-row justify-center items-center gap-2 text-primary-content shadow-sm cursor-pointer z-[1000]"
            type="button"
            onClick={resetMapView}
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>

          <div className="w-full h-full" ref={mapContainerRef} />
        </div>

        <div className="w-full min-w-0">
          <h3 className="font-semibold text-base-content">
            Villes principales
          </h3>

          <p className="mt-1 text-sm text-base-content/60">
            Cliquez sur une ville pour recentrer la carte.
          </p>

          <div className="w-full mt-4 flex flex-col justify-start items-stretch gap-2">
            {topMappedLocations.length === 0 && (
              <EmptyLocationsCard />
            )}

            {topMappedLocations.length > 0 && topMappedLocations.map(function (location) {
              return (
                <LocationItem
                  key={location.city}
                  location={location}
                  onFocusLocation={focusLocation}
                />
              );
            })}
          </div>

          {mappedLocations.length > 5 && (
            <p className="mt-4 text-xs text-base-content/50">
              +{mappedLocations.length - 5} autre(s) ville(s) détectée(s).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplicationsLocationMap;
