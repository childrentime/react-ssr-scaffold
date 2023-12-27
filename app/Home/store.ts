import { observable } from "mobx";
import BaseRootStore from "../../core/store/baseRootStore";
import HomeService from "./service";

export default class RootStore extends BaseRootStore {
  @observable todos: any = [];
  async init(): Promise<void> {
    const promiseArr: Promise<any>[] = [this.getTodos()];
    await Promise.all(promiseArr);
  }

  get todo() {
    return this.todos[0];
  }

  getTodos = async () => {
    const todos = await this.service.getTodos();
    this.todos = todos;
  };

  service = new HomeService(this);
}
