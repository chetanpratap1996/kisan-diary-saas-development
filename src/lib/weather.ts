export interface WeatherForecast {
  time: string[];
  precipitation_probability_max: number[];
  precipitation_sum: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export async function getCoordinates(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast | null> {
  try {
    // 14 days forecast helps us look ahead for smart scheduling
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=14`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.daily;
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}
