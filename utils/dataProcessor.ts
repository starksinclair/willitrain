// Utility functions for processing weather data from JSON files

export interface ProcessedWeatherData {
  date: string;
  temperature: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
  humidity: number;
}

export class DataProcessor {
  // Process the NASA POWER data JSON format
  static processNASAData(jsonData: any): ProcessedWeatherData[] {
    const results: ProcessedWeatherData[] = [];

    if (!jsonData.properties?.parameter) {
      return results;
    }

    const parameters = jsonData.properties.parameter;
    const dates = Object.keys(parameters.T2M || {}); // Temperature dates

    dates.forEach((date) => {
      const temp = parameters.T2M?.[date] || 0;
      const windSpeed = parameters.WS2M?.[date] || 0;
      const precipitation = parameters.PRECTOT?.[date] || 0;
      const humidity = parameters.RH2M?.[date] || 0;

      // Convert temperature from Kelvin to Celsius
      const temperatureCelsius = temp - 273.15;

      // Determine weather condition based on temperature and precipitation
      let condition = "clear";
      if (precipitation > 0.1) {
        condition = temp < 0 ? "snow" : "rain";
      } else if (temp < 5) {
        condition = "cold";
      } else if (temp > 30) {
        condition = "hot";
      } else if (windSpeed > 10) {
        condition = "windy";
      }

      results.push({
        date,
        temperature: Math.round(temperatureCelsius * 10) / 10,
        condition,
        windSpeed: Math.round(windSpeed * 10) / 10,
        precipitation: Math.round(precipitation * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
      });
    });

    return results.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  // Get weather data for a specific date range
  static getWeatherForDateRange(
    data: ProcessedWeatherData[],
    startDate: string,
    endDate: string
  ): ProcessedWeatherData[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });
  }

  // Get average weather conditions for a date range
  static getAverageWeather(data: ProcessedWeatherData[]): ProcessedWeatherData {
    if (data.length === 0) {
      return {
        date: new Date().toISOString().split("T")[0],
        temperature: 0,
        condition: "unknown",
        windSpeed: 0,
        precipitation: 0,
        humidity: 0,
      };
    }

    const avgTemp =
      data.reduce((sum, item) => sum + item.temperature, 0) / data.length;
    const avgWind =
      data.reduce((sum, item) => sum + item.windSpeed, 0) / data.length;
    const avgPrecip =
      data.reduce((sum, item) => sum + item.precipitation, 0) / data.length;
    const avgHumidity =
      data.reduce((sum, item) => sum + item.humidity, 0) / data.length;

    // Determine most common condition
    const conditions = data.map((item) => item.condition);
    const conditionCounts = conditions.reduce(
      (acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostCommonCondition = Object.keys(conditionCounts).reduce((a, b) =>
      conditionCounts[a] > conditionCounts[b] ? a : b
    );

    return {
      date: data[0].date,
      temperature: Math.round(avgTemp * 10) / 10,
      condition: mostCommonCondition,
      windSpeed: Math.round(avgWind * 10) / 10,
      precipitation: Math.round(avgPrecip * 10) / 10,
      humidity: Math.round(avgHumidity * 10) / 10,
    };
  }

  // Get weather forecast for next N days
  static getWeatherForecast(
    data: ProcessedWeatherData[],
    days: number = 7
  ): ProcessedWeatherData[] {
    const today = new Date();
    const futureData = data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= today;
    });

    return futureData.slice(0, days);
  }

  // Find best days for specific activities
  static findBestDaysForActivity(
    data: ProcessedWeatherData[],
    activity: string,
    days: number = 5
  ): ProcessedWeatherData[] {
    const activityConditions = this.getActivityConditions(activity);

    const scoredDays = data.map((item) => ({
      ...item,
      score: this.calculateActivityScore(item, activityConditions),
    }));

    return scoredDays
      .sort((a, b) => b.score - a.score)
      .slice(0, days)
      .map(({ score, ...item }) => item);
  }

  private static getActivityConditions(activity: string) {
    const conditions: Record<string, any> = {
      hiking: {
        idealTemp: { min: 10, max: 25 },
        maxWind: 20,
        maxPrecip: 5,
        preferredConditions: ["clear", "partly-cloudy"],
      },
      fishing: {
        idealTemp: { min: 15, max: 30 },
        maxWind: 15,
        maxPrecip: 10,
        preferredConditions: ["clear", "partly-cloudy"],
      },
      camping: {
        idealTemp: { min: 15, max: 25 },
        maxWind: 10,
        maxPrecip: 0,
        preferredConditions: ["clear"],
      },
      running: {
        idealTemp: { min: 5, max: 25 },
        maxWind: 15,
        maxPrecip: 5,
        preferredConditions: ["clear", "partly-cloudy"],
      },
    };

    return conditions[activity.toLowerCase()] || conditions.hiking;
  }

  private static calculateActivityScore(
    weather: ProcessedWeatherData,
    conditions: any
  ): number {
    let score = 0;

    // Temperature score
    if (
      weather.temperature >= conditions.idealTemp.min &&
      weather.temperature <= conditions.idealTemp.max
    ) {
      score += 40;
    } else {
      const tempDiff = Math.min(
        Math.abs(weather.temperature - conditions.idealTemp.min),
        Math.abs(weather.temperature - conditions.idealTemp.max)
      );
      score += Math.max(0, 40 - tempDiff * 2);
    }

    // Wind score
    if (weather.windSpeed <= conditions.maxWind) {
      score += 20;
    } else {
      score += Math.max(0, 20 - (weather.windSpeed - conditions.maxWind));
    }

    // Precipitation score
    if (weather.precipitation <= conditions.maxPrecip) {
      score += 20;
    } else {
      score += Math.max(0, 20 - weather.precipitation * 2);
    }

    // Condition score
    if (conditions.preferredConditions.includes(weather.condition)) {
      score += 20;
    }

    return Math.round(score);
  }
}
