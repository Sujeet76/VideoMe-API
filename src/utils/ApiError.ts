class ApiError extends Error {
  public statusCode: number;
  public data: null | any[];
  public error: any[];

  constructor(
    statusCode: number,
    message = "something went wrong",
    stack = "",
    error: any[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.data = null;
    this.error = error;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
