import { AppComponentClass } from "./appProvider";

export const INITIAL_PROPS_LOADED = "InitialPropsLoaded";

export function waitRawDataReady() {
  return new Promise<void>((res) => {
    // 如果有rawData或DOM ready了代表可以执行初始化了，否则监听它俩
    if (window.hasOwnProperty("rawData") || document.readyState !== "loading") {
      res();
    } else {
      // @ts-ignore
      document.addEventListener(INITIAL_PROPS_LOADED, res, { once: true });
      // @ts-ignore
      document.addEventListener("DOMContentLoaded", res, { once: true });
    }
  });
}

export const runClient = async (App: AppComponentClass) => {
  return waitRawDataReady().then(
    () =>
      new Promise((resolve) => {
        resolve(runApp(App));
      })
  );
};

const runApp = (App: AppComponentClass) => {
  const stores = App.createStores();
  // 反序列化 可以override fromJS方法来自定义
  Object.keys(stores).forEach((key) =>
    stores[key].fromJS((window.rawData?.stores || {})[key])
  );
  if (window.rawData) {
    window.__INITIAL_PROPS__ = { stores };
  }
  if (process.env.NODE_ENV === "development") {
    window.stores = stores;
  }
};
