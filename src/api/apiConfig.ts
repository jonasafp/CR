export type DataSourceMode =
  | "mock"
  | "api";

function getDataSourceMode(): DataSourceMode {
  const value =
    import.meta.env.VITE_DATA_SOURCE;

  return value === "api"
    ? "api"
    : "mock";
}

function getApiTimeout(): number {
  const value = Number(
    import.meta.env.VITE_API_TIMEOUT,
  );

  if (
    Number.isNaN(value) ||
    value <= 0
  ) {
    return 15000;
  }

  return value;
}

export const apiConfig = {
  dataSource: getDataSourceMode(),

  baseUrl:
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:3000/api",

  timeout: getApiTimeout(),
};