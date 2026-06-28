import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { MapPinned, RotateCcw } from "lucide-react";
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
    html: "<div class=\"flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-content shadow-lg\">" + String(location.count) + "</div>",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function getMapBounds(locations) {
  const bounds = [];

  locations.forEach(function (location) {
    bounds.push([location.latitude, location.longitude]);
  });

  return bounds;
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
      padding: [36, 36],
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
    <div className="rounded-2xl bg-base-100 p-6 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <MapPinned className="h-6 w-6 text-primary" />

          <h2 className="text-xl font-bold">
            Carte des candidatures
          </h2>
        </div>

        <p className="mt-2 text-sm text-base-content/60">
          Visualisation des villes reconnues à partir des localisations renseignées.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr] xl:items-start">
        <div className="relative h-[360px] overflow-hidden rounded-2xl border border-base-300 bg-base-200 sm:h-[420px] xl:h-[430px]">
          <button
            className="btn btn-sm btn-primary absolute left-3 bottom-3 z-[1000] text-white shadow-lg"
            type="button"
            onClick={resetMapView}
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser
          </button>

          <div className="h-full w-full" ref={mapContainerRef} />
        </div>

        <div className="min-w-0 self-start rounded-2xl border border-base-300 p-4">
          {topMappedLocations.length === 0 && (
            <div className="rounded-2xl bg-base-200 p-4">
              <p className="text-sm text-base-content/60">
                Aucune ville reconnue pour le moment.
              </p>
            </div>
          )}

          {topMappedLocations.length > 0 && (
            <div className="space-y-3">
              {topMappedLocations.map(function (location) {
                return (
                  <button
                    className="flex w-full items-center justify-between gap-3 rounded-2xl bg-base-200 p-4 text-left hover:bg-base-300"
                    key={location.city}
                    type="button"
                    onClick={function () { focusLocation(location); }}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {location.city}
                      </p>

                      <p className="text-xs text-base-content/50">
                        {location.count} candidature(s)
                      </p>
                    </div>

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-content shadow-lg">
                      {location.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {mappedLocations.length > 5 && (
            <p className="mt-3 text-xs text-base-content/50">
              +{mappedLocations.length - 5} autre(s) ville(s) détectée(s).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplicationsLocationMap;
