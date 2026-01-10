/**
 * Type definitions for the Home Dashboard application
 */

// Light types
export type LightType = "hue" | "hue_group" | "govee";

export interface LightConfig {
  id: string;
  name: string;
  type: LightType;
  deviceId: string;
  sku?: string; // Only for Govee lights
}

export interface Light {
  id: string;
  name: string;
  type: LightType;
  state: "on" | "off";
  brightness: number; // 0-100
  deviceId: string;
  sku?: string;
}

export interface LightsResponse {
  lights: Light[];
}

// Temperature types
export interface Temperature {
  temp: number;
  unit: "F" | "C";
  timestamp: string;
}

// Alert/Video types
export interface Alert {
  filename: string;
  url: string;
  timestamp: string;
}

export interface AlertsResponse {
  alerts: Alert[];
}

// Stats types
export interface PiStats {
  cpu_temp: number;
  cpu_usage: number;
  ram_usage: number;
  disk_usage: number;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
}

export interface CalendarResponse {
  events: CalendarEvent[];
  date: string;
}

// Widget layout types
export interface WidgetLayout {
  id: string;
  type: "light" | "temperature" | "calendar";
  position: number;
  data?: Record<string, unknown>; // Additional widget-specific data
}

// API response types
export interface ApiError {
  error: string;
  message: string;
}

// Health check types
export interface HealthResponse {
  status: string;
  uptime: number;
}
