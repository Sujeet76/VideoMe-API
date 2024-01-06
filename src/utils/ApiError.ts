export class ApiError extends Error {
  public statusCode: number;
  public message: string;
  public error: [];
  public stack?: string | undefined;
  constructor(statusCode: number, message: string, error: [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    if (this.stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
