export function readLocalStorage<T>(
  key: string,
  fallbackValue: T,
): T {
  try {
    const storedValue =
      window.localStorage.getItem(key);

    if (!storedValue) {
      return fallbackValue;
    }

    return JSON.parse(storedValue) as T;
  } catch (error) {
    console.error(
      `Não foi possível ler "${key}" do armazenamento local.`,
      error,
    );

    return fallbackValue;
  }
}

export function writeLocalStorage<T>(
  key: string,
  value: T,
): void {
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(value),
    );
  } catch (error) {
    console.error(
      `Não foi possível salvar "${key}" no armazenamento local.`,
      error,
    );
  }
}

export function removeLocalStorage(
  key: string,
): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(
      `Não foi possível remover "${key}" do armazenamento local.`,
      error,
    );
  }
}