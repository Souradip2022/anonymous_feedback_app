export class ApiResponseHandler {
  data: {};
  success: boolean;
  message: string;

  constructor(success: boolean, message: string, data: {}) {
    this.success = success
    this.message = message;
    this.data = data;
  }
}
