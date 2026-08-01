// Service météo basé sur Open-Meteo (https://open-meteo.com).
// Gratuit, sans clé API, sans inscription.
// Fournit la météo actuelle pour une position GPS donnée.

export interface MeteoActuelle {
  temperature: number       // °C (arrondi à 1 décimale)
  temperatureRessentie: number
  humidite: number          // %
  precipitation: number     // mm (dernière heure)
  vitesseVent: number       // km/h
  codeMeteo: number         // WMO weather code
  heure: string             // ISO 8601
}

// Codes WMO → libellé + emoji
// Source : https://open-meteo.com/en/docs (section Weather variable documentation)
export interface DescriptionMeteo {
  libelle: string
  emoji: string
}

const CODES_METEO: Record<number, DescriptionMeteo> = {
  0:  { libelle: "Ciel degage",           emoji: "Ensoleille"         },
  1:  { libelle: "Principalement degage", emoji: "Peu nuageux"        },
  2:  { libelle: "Partiellement nuageux", emoji: "Nuageux"            },
  3:  { libelle: "Couvert",               emoji: "Couvert"            },
  45: { libelle: "Brouillard",            emoji: "Brouillard"         },
  48: { libelle: "Brouillard givrant",    emoji: "Brouillard givrant" },
  51: { libelle: "Bruine legere",         emoji: "Bruine"             },
  53: { libelle: "Bruine moderee",        emoji: "Bruine"             },
  55: { libelle: "Bruine dense",          emoji: "Pluie"              },
  61: { libelle: "Pluie legere",          emoji: "Pluie"              },
  63: { libelle: "Pluie moderee",         emoji: "Pluie"              },
  65: { libelle: "Pluie forte",           emoji: "Pluie forte"        },
  71: { libelle: "Neige legere",          emoji: "Neige"              },
  73: { libelle: "Neige moderee",         emoji: "Neige"              },
  75: { libelle: "Neige forte",           emoji: "Neige forte"        },
  80: { libelle: "Averses legeres",       emoji: "Averses"            },
  81: { libelle: "Averses moderees",      emoji: "Averses"            },
  82: { libelle: "Averses violentes",     emoji: "Averses violentes"  },
  95: { libelle: "Orage",                 emoji: "Orage"              },
  96: { libelle: "Orage avec grele",      emoji: "Orage"              },
  99: { libelle: "Orage avec forte grele",emoji: "Orage"              },
}

export function descriptionMeteo(code: number): DescriptionMeteo {
  return CODES_METEO[code] ?? { libelle: "Conditions inconnues", emoji: "Inconnu" }
}

// Appel direct à l'API Open-Meteo (côté navigateur, pas de proxy nécessaire).
export async function getMeteo(
  latitude: number,
  longitude: number,
): Promise<MeteoActuelle> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m` +
    `,precipitation,wind_speed_10m,weather_code` +
    `&wind_speed_unit=kmh` +
    `&timezone=Africa%2FLome`

  const res = await fetch(url)
  if (!res.ok) throw new Error("Météo indisponible pour cette localisation.")

  const data = await res.json()
  const c = data.current

  return {
    temperature:          Math.round(c.temperature_2m * 10) / 10,
    temperatureRessentie: Math.round(c.apparent_temperature * 10) / 10,
    humidite:             c.relative_humidity_2m,
    precipitation:        c.precipitation,
    vitesseVent:          Math.round(c.wind_speed_10m),
    codeMeteo:            c.weather_code,
    heure:                c.time,
  }
}
