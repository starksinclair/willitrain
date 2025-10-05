// Weather Service for fetching and processing weather data

export interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
  humidity: number;
  timestamp: string;
}

export interface ActivityRecommendation {
  activity: string;
  recommendation: "recommended" | "caution" | "not-recommended";
  reason: string;
  gear: string[];
}

class WeatherService {
  private baseUrl = "https://api.weather.com";
  private openMeteoUrl = "https://api.open-meteo.com/v1/forecast";

  // Method 2: Fetch from Open-Meteo API
  async fetchOpenMeteoWeatherData(
    latitude: number,
    longitude: number
  ): Promise<WeatherData> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current:
          "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
        timezone: "auto",
        forecast_days: "1",
        temperature_unit: "fahrenheit",
      });

      const response = await fetch(`${this.openMeteoUrl}?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return this.processOpenMeteoData(data);
    } catch (error) {
      console.error("Error fetching Open-Meteo weather data:", error);
      throw error;
    }
  }

  // Process Open-Meteo API data
  private processOpenMeteoData(data: any): WeatherData {
    const current = data.current;
    const weatherCode = current.weather_code;

    // Convert weather code to condition string
    const condition = this.getWeatherConditionFromCode(weatherCode);

    return {
      temperature: Math.round(current.temperature_2m),
      condition: condition,
      windSpeed: Math.round(current.wind_speed_10m),
      precipitation: Math.round((current.precipitation || 0) * 100), // Convert to percentage
      humidity: Math.round(current.relative_humidity_2m),
      timestamp: new Date().toISOString(),
    };
  }

  // Convert weather code to readable condition
  private getWeatherConditionFromCode(code: number): string {
    // Based on WMO Weather interpretation codes
    if (code === 0) return "clear";
    if (code >= 1 && code <= 3) return "partly-cloudy";
    if (code >= 45 && code <= 48) return "foggy";
    if (code >= 51 && code <= 67) return "rain";
    if (code >= 71 && code <= 77) return "snow";
    if (code >= 80 && code <= 86) return "rain";
    if (code >= 95 && code <= 99) return "thunderstorm";
    return "cloudy";
  }

  // Get activity recommendations based on weather
  getActivityRecommendations(
    weatherData: WeatherData
  ): ActivityRecommendation[] {
    const activities = [
      {
        activity: "Hiking",
        conditions: ["clear", "partly-cloudy"],
        minTemp: 5,
        maxTemp: 35,
        maxWind: 30,
        maxPrecipitation: 20,
      },
      {
        activity: "Fishing",
        conditions: ["clear", "partly-cloudy"],
        minTemp: 10,
        maxTemp: 30,
        maxWind: 25,
        maxPrecipitation: 10,
      },
      {
        activity: "Camping",
        conditions: ["clear"],
        minTemp: 15,
        maxTemp: 25,
        maxWind: 20,
        maxPrecipitation: 5,
      },
    ];

    return activities.map((activity) => {
      const isGoodCondition = activity.conditions.includes(
        weatherData.condition
      );
      const isGoodTemp =
        weatherData.temperature >= activity.minTemp &&
        weatherData.temperature <= activity.maxTemp;
      const isGoodWind = weatherData.windSpeed <= activity.maxWind;
      const isGoodPrecipitation =
        weatherData.precipitation <= activity.maxPrecipitation;

      let recommendation: "recommended" | "caution" | "not-recommended";
      let reason = "";

      if (isGoodCondition && isGoodTemp && isGoodWind && isGoodPrecipitation) {
        recommendation = "recommended";
        reason = "Perfect weather conditions for this activity";
      } else if (
        isGoodCondition &&
        isGoodTemp &&
        (isGoodWind || isGoodPrecipitation)
      ) {
        recommendation = "caution";
        reason = "Weather conditions are acceptable but not ideal";
      } else {
        recommendation = "not-recommended";
        reason = "Weather conditions are not suitable for this activity";
      }

      return {
        activity: activity.activity,
        recommendation,
        reason,
        gear: this.getRecommendedGear(activity.activity, weatherData),
      };
    });
  }

  // Get recommended gear based on activity and weather
  private getRecommendedGear(activity: string, weather: WeatherData): string[] {
    const baseGear = ["water-bottle", "first-aid-kit"];
    const weatherGear = [];

    if (weather.temperature < 10) {
      weatherGear.push("warm-jacket", "gloves", "hat");
    } else if (weather.temperature > 25) {
      weatherGear.push("sunscreen", "hat", "light-clothing");
    }

    if (weather.precipitation > 10) {
      weatherGear.push("rain-jacket", "waterproof-boots");
    }

    if (weather.windSpeed > 15) {
      weatherGear.push("windbreaker");
    }

    return [...baseGear, ...weatherGear];
  }
}

export default new WeatherService();
