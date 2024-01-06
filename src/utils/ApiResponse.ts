export class ApiResponse {
  public status: number;
  public message: string;
  public data: any;
  constructor(status: number, message: string, data: any) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
