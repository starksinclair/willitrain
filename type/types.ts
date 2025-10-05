export interface WeatherData {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number, number]; // [longitude, latitude, elevation]
  };
  properties: {
    parameter: WeatherParameters;
    message: string;
    status: string;
    executionTime: number;
    version: string;
    user: string;
    date: string;
    location: {
      lat: number;
      lon: number;
      elevation: number;
    };
    request: {
      parameter: string;
      options: {
        format: string;
        unit_system: string;
        short_hand: boolean;
        reduce_grid: boolean;
      };
      geometry: {
        type: string;
        coordinates: [number, number, number];
      };
      geometry_type: string;
      start: string;
      end: string;
      outputsize: string;
      user: string;
    };
    request_index: number;
    info: {
      units: string;
      time_standard: string;
      start: string;
      end: string;
    };
    messages: string[];
    parameters: ParameterMetadata;
    times: {
      data: number;
      process: number;
    };
  };
}

export interface WeatherParameters {
  T2M: TimeSeriesData; // Temperature at 2 Meters
  WS2M: TimeSeriesData; // Wind Speed at 2 Meters
  PRECTOTCORR: TimeSeriesData; // Precipitation Corrected
  SNODP: TimeSeriesData; // Snow Depth
}

export interface TimeSeriesData {
  [date: string]: number; // Date in YYYYMMDD format -> value
}

export interface ParameterMetadata {
  T2M: ParameterInfo;
  WS2M: ParameterInfo;
  PRECTOTCORR: ParameterInfo;
  SNODP: ParameterInfo;
}

export interface ParameterInfo {
  units: string;
  longname: string;
}

export interface WeatherCondition {
  id: string;
  label: string;
  probability: number;
  icon: string;
  color: string;
}
