import BaseService from "../../core/store/baseService";

export default class HomeService extends BaseService {
  async getTodos() {
    return this.get("/api/todos");
  }
}
