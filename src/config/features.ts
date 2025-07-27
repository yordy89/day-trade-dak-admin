// Feature flags configuration
export const features = {
  // Meeting features
  meetings: {
    enabled: true, // Set to true to show meeting features
  },
  
  // Other features can be added here
} as const;

export type Features = typeof features;