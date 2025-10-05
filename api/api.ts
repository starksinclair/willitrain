import { useQuery } from "@tanstack/react-query";
import { WeatherData } from "../type/types";

export const useGetWeatherData = (
  start: string,
  end: string,
  latitude: string,
  longitude: string,
  parameters: string
) => {
  return useQuery<WeatherData>({
    queryKey: ["weatherData", start, end, latitude, longitude, parameters],
    queryFn: async () => {
      const apiUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${parameters}&start=${start}&end=${end}&latitude=${latitude}&longitude=${longitude}&format=JSON&community=RE&units=imperial`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      return data;
    },
  });
};
