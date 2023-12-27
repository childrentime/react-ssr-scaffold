import { action, makeObservable, observable, toJS } from "mobx";
import { createDefaultAxios } from "../http/index";
import type express from "express";
import { AxiosInstance } from "axios";
import { AppServerContext } from "../requestContext/server";

/**
 * 同构化视图数据模型
 *
 * ssr 生命周期：
 *
 *   server:
 *     constructor -> initServerData -> init -> finishServerRender -> finishInitLoading -> toJSON
 *
 *   client:
 *     constructor -> fromJS -> finishInitLoading
 *
 * csr 生命周期：
 *   constructor -> initClientData -> init -> finishInitLoading
 *
 */
export default abstract class PageStore {
  $axiosHttp: AxiosInstance | null = null;

  @observable private isServerRendered = false;

  @observable private isFinishInitLoading = false;

  constructor() {
    makeObservable(this);
  }

  initAxiosHttp({
    req,
    res,
  }: {
    req?: express.Request;
    res?: express.Response;
  }) {
    const params = process.env.BROWSER ? {} : { req: req, res };
    // @ts-ignore
    this.$axiosHttp = createDefaultAxios(params);
  }

  @action protected finishServerRender() {
    this.finishInitLoading();
    this.isServerRendered = true;
  }

  @action finishInitLoading() {
    this.isFinishInitLoading = true;
  }

  @action
  prepareClientData() {}

  abstract init(): Promise<void>;

  @action
  async initClientData() {
    try {
      this.initAxiosHttp({});
      await this.init();
      this.prepareClientData();
    } catch (err) {
      console.log(err);
    }
  }

  @action
  async initServerData(requestContext: AppServerContext) {
    try {
      this.initAxiosHttp({
        req: requestContext.__req,
        res: requestContext.__res,
      });
      await this.init();
      this.finishServerRender();
    } catch (err) {
      console.log(err);
    }
  }

  @action
  fromJS(rawData: any) {
    if (rawData && rawData.isServerRendered) {
      Object.assign(this, rawData);
      this.initAxiosHttp({});
    }
  }

  toJSON() {
    return toJS(this);
  }
}
