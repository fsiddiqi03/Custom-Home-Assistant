/**
 * Application constants and configuration
 */

// API Base URLs
// PI1 hosts the frontend, camera, calendar, alerts, and stats
export const PI1_API_URL = process.env.PI1_API_URL;

// Home API (Pi2) handles lights and sensors
export const HOME_API_URL = process.env.HOME_API_URL;

// Direct camera stream URL (on Pi1, bypasses Next.js proxy for performance)
export const CAMERA_STREAM_URL =
  process.env.NEXT_PUBLIC_CAMERA_STREAM_URL;

// Polling intervals (milliseconds)
export const POLLING_INTERVALS = {
  LIGHTS: 30000, // 30 seconds
  TEMPERATURE: 60000, // 60 seconds
  STATS: 15000, // 15 seconds
  CALENDAR: 900000, // 15 minutes
} as const;

// Hue Light IDs
export const HUE_LIGHT_IDS = {
  FRONTDOOR: process.env.HUE_FRONTDOOR_ID || "f8337a1f-d759-4db5-8041-ef713624ac79",
} as const;

// Hue Group IDs
export const HUE_GROUP_IDS = {
  MAIN: process.env.HUE_GROUP_ID || "12b0d9b6-5ee4-4032-a4b0-09a78c9bdd08",
} as const;

// Govee SKU
export const GOVEE_SKU = process.env.GOVEE_SKU || "H6062";

// Govee Device IDs
export const GOVEE_DEVICE_IDS = {
  DESK: process.env.GOVEE_DESK_ID || "31:74:D4:31:30:30:53:5F",
  TV: process.env.GOVEE_TV_ID || "7B:CE:C6:37:36:39:4F:90",
} as const;

// Light configuration for the dashboard
export const LIGHTS_CONFIG = [
  {
    id: "hue_frontdoor",
    name: "Front Door",
    type: "hue" as const,
    deviceId: HUE_LIGHT_IDS.FRONTDOOR,
  },
  {
    id: "hue_group_main",
    name: "Living Room",
    type: "hue_group" as const,
    deviceId: HUE_GROUP_IDS.MAIN,
  },
  {
    id: "govee_desk",
    name: "Desk",
    type: "govee" as const,
    deviceId: GOVEE_DEVICE_IDS.DESK,
    sku: GOVEE_SKU,
  },
  {
    id: "govee_tv",
    name: "TV",
    type: "govee" as const,
    deviceId: GOVEE_DEVICE_IDS.TV,
    sku: GOVEE_SKU,
  },
] as const;

// Light IDs for backwards compatibility with layout storage
export const LIGHT_IDS = {
  FRONTDOOR: "hue_frontdoor",
  LIVING: "hue_group_main",
  DESK: "govee_desk",
  TV: "govee_tv",
} as const;

// Light names for display
export const LIGHT_NAMES = {
  [LIGHT_IDS.FRONTDOOR]: "Front Door",
  [LIGHT_IDS.LIVING]: "Living Room",
  [LIGHT_IDS.DESK]: "Desk",
  [LIGHT_IDS.TV]: "TV",
} as const;

// Navigation routes
export const ROUTES = {
  HOME: "/",
  CAMERA: "/camera",
  SYSTEM: "/system",
} as const;
