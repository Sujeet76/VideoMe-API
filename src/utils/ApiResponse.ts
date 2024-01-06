export class ApiResponse {
  public status: number;
  public message: string;
  public success: boolean;
  public data: any;
  constructor(status: number, message: string, data: any) {
    this.status = status;
    this.success = 400 > this.status;
    this.message = message;
    this.data = data;
  }
}
