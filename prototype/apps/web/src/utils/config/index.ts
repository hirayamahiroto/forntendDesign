const readRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not set`);
  return value;
};

export const getApiServerBaseUrl = () => readRequiredEnv("API_SERVER_BASE_URL");

export const getAppBaseUrl = () => readRequiredEnv("APP_BASE_URL");
