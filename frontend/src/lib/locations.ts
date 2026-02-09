export const LOCATION_CATEGORIES = {
  "Boys Hostel": [
    "Sapphire",
    "Emerald",
    "Ruby",
    "Diamond",
    "Coral",
    "Pearl",
  ],
  "Girls Hostel": [
    "Ganga",
    "Yamuna",
    "Narmadha",
    "Cauvery",
    "North Bhavani",
    "South Bhavani",
    "Old Bhavani",
  ],
  "Academic Blocks": [
    "Applied Science (AS)",
    "Industry Block (IB)",
    "Sun Flower Block",
    "School of Mechanical",
    "Research Park",
  ],
} as const;

export type LocationCategory = keyof typeof LOCATION_CATEGORIES;

export const ALL_LOCATIONS = Object.entries(LOCATION_CATEGORIES).flatMap(
  ([category, locations]) =>
    locations.map((loc) => ({ category, name: loc, value: `${category} - ${loc}` }))
);

export const FLAT_LOCATION_NAMES = ALL_LOCATIONS.map((l) => l.value);