export class ApiResponseHandler {
  statusCode: number;
  data: {};
  success: boolean;
  message: string;

  constructor(statusCode: number, data: {}, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
