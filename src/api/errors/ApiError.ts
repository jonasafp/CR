export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  public readonly fieldErrors?: Record<
    string,
    string[]
  >;

  constructor(
    message: string,
    status = 500,
    code?: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}