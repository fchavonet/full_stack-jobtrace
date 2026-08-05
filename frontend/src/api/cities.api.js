const CITIES_API_URL =
  "https://geo.api.gouv.fr/communes";

const MIN_CITY_QUERY_LENGTH = 2;
const MAX_CITY_RESULTS = 5;

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function buildCityLabel(
  name,
  departmentCode,
  departmentName
) {
  if (
    departmentCode
    && departmentName
  ) {
    return name
      + " ("
      + departmentCode
      + " - "
      + departmentName
      + ")";
  }

  if (departmentCode) {
    return name
      + " ("
      + departmentCode
      + ")";
  }

  return name;
}

function getPostalCodes(properties) {
  if (
    !Array.isArray(
      properties.codesPostaux
    )
  ) {
    return [];
  }

  return properties.codesPostaux.filter(
    function (postalCode) {
      return typeof postalCode
        === "string";
    }
  );
}

function sanitizeCityFeature(feature) {
  if (
    !feature
    || typeof feature !== "object"
  ) {
    return null;
  }

  const properties = feature.properties;

  if (
    !properties
    || typeof properties !== "object"
  ) {
    return null;
  }

  const geometry = feature.geometry;

  if (
    !geometry
    || geometry.type !== "Point"
    || !Array.isArray(
      geometry.coordinates
    )
  ) {
    return null;
  }

  const name =
    normalizeText(properties.nom);

  const code =
    normalizeText(properties.code);

  if (!name || !code) {
    return null;
  }

  const longitude =
    Number(geometry.coordinates[0]);

  const latitude =
    Number(geometry.coordinates[1]);

  if (
    !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
  ) {
    return null;
  }

  if (
    latitude < -90
    || latitude > 90
    || longitude < -180
    || longitude > 180
  ) {
    return null;
  }

  let departmentCode = "";
  let departmentName = "";

  if (
    properties.departement
    && typeof properties.departement
      === "object"
  ) {
    departmentCode =
      normalizeText(
        properties.departement.code
      );

    departmentName =
      normalizeText(
        properties.departement.nom
      );
  }

  return {
    code,
    name,
    label: buildCityLabel(
      name,
      departmentCode,
      departmentName
    ),
    departmentCode,
    departmentName,
    postalCodes:
      getPostalCodes(properties),
    latitude,
    longitude
  };
}

export async function searchCities(
  query,
  options = {}
) {
  const normalizedQuery =
    normalizeText(query);

  if (
    normalizedQuery.length
      < MIN_CITY_QUERY_LENGTH
  ) {
    return [];
  }

  const url = new URL(
    CITIES_API_URL
  );

  url.searchParams.set(
    "nom",
    normalizedQuery
  );

  url.searchParams.set(
    "fields",
    "nom,code,codesPostaux,departement"
  );

  url.searchParams.set(
    "boost",
    "population"
  );

  url.searchParams.set(
    "limit",
    String(MAX_CITY_RESULTS)
  );

  url.searchParams.set(
    "format",
    "geojson"
  );

  url.searchParams.set(
    "geometry",
    "centre"
  );

  const requestOptions = {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  };

  if (options.signal) {
    requestOptions.signal =
      options.signal;
  }

  const response = await fetch(
    url.toString(),
    requestOptions
  );

  if (!response.ok) {
    const error = new Error(
      "Unable to search cities."
    );

    error.statusCode =
      response.status;

    throw error;
  }

  const data = await response.json();

  if (
    !data
    || data.type
      !== "FeatureCollection"
    || !Array.isArray(data.features)
  ) {
    return [];
  }

  return data.features
    .map(function (feature) {
      return sanitizeCityFeature(
        feature
      );
    })
    .filter(function (city) {
      return city !== null;
    });
}
