import {Message} from "@/model/UserModel"

interface ApiResponseData {
  messages: Array<Message>
}

export class ApiResponseHandler {
  data: ApiResponseData | any ;
  success: boolean;
  message: string;

  constructor(success: boolean, message: string, data: ApiResponseData | any) {
    this.success = success
    this.message = message;
    this.data = data;
  }
}
