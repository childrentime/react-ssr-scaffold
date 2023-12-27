import { AxiosInstance } from "axios";

export default abstract class BaseService {
  rootStore: any;

  get http(): AxiosInstance {
    return this.rootStore().$axiosHttp!;
  }

  constructor(store: any) {
    this.rootStore = () => store;
  }

  async get(url: string, params = {} as Record<string, any>) {
    const request = this.http.get(url, { params }).catch((err) => {
      console.log(err);
      throw err;
    });
    return request;
  }

  async post(url: string, params = {} as Record<string, any>) {
    const request = this.http.post(url, params).catch((err) => {
      console.log(err);
      throw err;
    });
    return request;
  }
}
