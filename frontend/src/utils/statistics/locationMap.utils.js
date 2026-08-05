const CITY_COORDINATES = {
  aixenprovence: {
    city: "Aix-en-Provence",
    latitude: 43.5297,
    longitude: 5.4474
  },
  amiens: {
    city: "Amiens",
    latitude: 49.8941,
    longitude: 2.2958
  },
  angers: {
    city: "Angers",
    latitude: 47.4784,
    longitude: -0.5632
  },
  annecy: {
    city: "Annecy",
    latitude: 45.8992,
    longitude: 6.1294
  },
  avignon: {
    city: "Avignon",
    latitude: 43.9493,
    longitude: 4.8055
  },
  bayonne: {
    city: "Bayonne",
    latitude: 43.4933,
    longitude: -1.4748
  },
  besancon: {
    city: "Besançon",
    latitude: 47.2378,
    longitude: 6.0241
  },
  bordeaux: {
    city: "Bordeaux",
    latitude: 44.8378,
    longitude: -0.5792
  },
  brest: {
    city: "Brest",
    latitude: 48.3904,
    longitude: -4.4861
  },
  caen: {
    city: "Caen",
    latitude: 49.1829,
    longitude: -0.3707
  },
  clermontferrand: {
    city: "Clermont-Ferrand",
    latitude: 45.7772,
    longitude: 3.087
  },
  dijon: {
    city: "Dijon",
    latitude: 47.322,
    longitude: 5.0415
  },
  grenoble: {
    city: "Grenoble",
    latitude: 45.1885,
    longitude: 5.7245
  },
  lille: {
    city: "Lille",
    latitude: 50.6292,
    longitude: 3.0573
  },
  limoges: {
    city: "Limoges",
    latitude: 45.8336,
    longitude: 1.2611
  },
  lyon: {
    city: "Lyon",
    latitude: 45.764,
    longitude: 4.8357
  },
  marseille: {
    city: "Marseille",
    latitude: 43.2965,
    longitude: 5.3698
  },
  metz: {
    city: "Metz",
    latitude: 49.1193,
    longitude: 6.1757
  },
  montpellier: {
    city: "Montpellier",
    latitude: 43.6119,
    longitude: 3.8767
  },
  mulhouse: {
    city: "Mulhouse",
    latitude: 47.7508,
    longitude: 7.3359
  },
  nancy: {
    city: "Nancy",
    latitude: 48.6921,
    longitude: 6.1844
  },
  nantes: {
    city: "Nantes",
    latitude: 47.2184,
    longitude: -1.5536
  },
  nice: {
    city: "Nice",
    latitude: 43.7102,
    longitude: 7.2619
  },
  nimes: {
    city: "Nîmes",
    latitude: 43.8367,
    longitude: 4.3601
  },
  orleans: {
    city: "Orléans",
    latitude: 47.9029,
    longitude: 1.9093
  },
  paris: {
    city: "Paris",
    latitude: 48.8566,
    longitude: 2.3522
  },
  perpignan: {
    city: "Perpignan",
    latitude: 42.6887,
    longitude: 2.8954
  },
  poitiers: {
    city: "Poitiers",
    latitude: 46.5802,
    longitude: 0.3404
  },
  reims: {
    city: "Reims",
    latitude: 49.2583,
    longitude: 4.0317
  },
  rennes: {
    city: "Rennes",
    latitude: 48.1173,
    longitude: -1.6778
  },
  rouen: {
    city: "Rouen",
    latitude: 49.4432,
    longitude: 1.0993
  },
  saintetienne: {
    city: "Saint-Étienne",
    latitude: 45.4397,
    longitude: 4.3872
  },
  strasbourg: {
    city: "Strasbourg",
    latitude: 48.5734,
    longitude: 7.7521
  },
  toulon: {
    city: "Toulon",
    latitude: 43.1242,
    longitude: 5.928
  },
  toulouse: {
    city: "Toulouse",
    latitude: 43.6047,
    longitude: 1.4442
  },
  tours: {
    city: "Tours",
    latitude: 47.3941,
    longitude: 0.6848
  },
  villeurbanne: {
    city: "Villeurbanne",
    latitude: 45.7719,
    longitude: 4.8795
  }
};

function normalizeLocation(value) {
  if (
    !value
    || typeof value !== "string"
  ) {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(/saint-/g, "saint")
    .replace(/ste-/g, "sainte")
    .replace(/[^a-z]/g, "");
}

function getApplicationLocation(
  application
) {
  if (
    application
    && application.location
  ) {
    return application.location;
  }

  return "";
}

function getStoredCoordinates(
  application
) {
  if (!application) {
    return null;
  }

  if (
    application.locationLatitude
      === null
    || application.locationLatitude
      === undefined
    || application.locationLongitude
      === null
    || application.locationLongitude
      === undefined
  ) {
    return null;
  }

  const latitude =
    Number(
      application.locationLatitude
    );

  const longitude =
    Number(
      application.locationLongitude
    );

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

  let city =
    getApplicationLocation(
      application
    );

  if (!city) {
    city = "Localisation";
  }

  let key =
    "coordinates:"
    + latitude
    + ":"
    + longitude;

  if (application.locationCode) {
    key =
      "code:"
      + application.locationCode;
  }

  return {
    key,
    city,
    latitude,
    longitude,
    locationCode:
      application.locationCode || null
  };
}

function findKnownCity(location) {
  const normalizedLocation =
    normalizeLocation(location);

  if (!normalizedLocation) {
    return null;
  }

  const cityKeys =
    Object.keys(
      CITY_COORDINATES
    );

  for (
    let index = 0;
    index < cityKeys.length;
    index += 1
  ) {
    const cityKey = cityKeys[index];

    if (
      normalizedLocation.includes(
        cityKey
      )
    ) {
      const knownCity =
        CITY_COORDINATES[cityKey];

      return {
        key:
          "legacy:"
          + knownCity.city,
        city: knownCity.city,
        latitude:
          knownCity.latitude,
        longitude:
          knownCity.longitude,
        locationCode: null
      };
    }
  }

  return null;
}

function getMappedLocation(
  application
) {
  const storedCoordinates =
    getStoredCoordinates(
      application
    );

  if (storedCoordinates) {
    return storedCoordinates;
  }

  return findKnownCity(
    getApplicationLocation(
      application
    )
  );
}

function getApplicationLabel(
  application
) {
  if (!application) {
    return "Candidature";
  }

  if (
    application.company
    && application.position
  ) {
    return application.company
      + " - "
      + application.position;
  }

  if (application.company) {
    return application.company;
  }

  if (application.position) {
    return application.position;
  }

  return "Candidature";
}

export function buildApplicationsLocationMapData(
  applications
) {
  const locationsByKey = {};

  applications.forEach(
    function (application) {
      const location =
        getApplicationLocation(
          application
        );

      if (!location) {
        return;
      }

      const mappedLocation =
        getMappedLocation(
          application
        );

      if (!mappedLocation) {
        return;
      }

      if (
        !locationsByKey[
          mappedLocation.key
        ]
      ) {
        locationsByKey[
          mappedLocation.key
        ] = {
          city:
            mappedLocation.city,
          locationCode:
            mappedLocation
              .locationCode,
          latitude:
            mappedLocation.latitude,
          longitude:
            mappedLocation.longitude,
          count: 0,
          applications: []
        };
      }

      locationsByKey[
        mappedLocation.key
      ].count += 1;

      locationsByKey[
        mappedLocation.key
      ].applications.push({
        id: application.id,
        label:
          getApplicationLabel(
            application
          ),
        location
      });
    }
  );

  return Object.values(
    locationsByKey
  ).sort(
    function (
      firstLocation,
      secondLocation
    ) {
      return secondLocation.count
        - firstLocation.count;
    }
  );
}
