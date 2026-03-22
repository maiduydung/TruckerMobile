const Config = {
  // Azure Function App or Container App endpoint
  apiBaseUrl: __DEV__
    ? 'http://localhost:7071/api'
    : 'https://nhutin-api.azurewebsites.net/api',

  // Endpoint
  endpoint: '/trips',

  // GPS
  gps: {
    timeoutMs: 15000,
    maxAgeMs: 60000,
    enableHighAccuracy: true,
  },
};

export default Config;
