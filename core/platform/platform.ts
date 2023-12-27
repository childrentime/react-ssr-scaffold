export enum PLATFORM {
  Unknown = "unknown",
  IOS = "ios",
  Android = "android",
  WeChat = "wechat",
  Weibo = "weibo",
  QQ = "qq",
  QQApp = "qqapp",
  WxApp = "wxapp",
}

const REG = {
  MiniProgram: /miniprogram/i,
  WeChat: /MicroMessenger/i,
  QQ: /QQ\/[\d\.]+\s+/i,
  QQAndQzone: /(QQ\/[\d\.]+\s+)|Qzone/i,
  QQApp: /QQ\//i,
  Weibo: /Weibo/i,
  Ios: /iphone|ipad|ipod/i,
  IosVersion: /os (\d+)_(\d+)_?(\d+)?/i,
  Android: /Android/i,
  AndroidVersion: /Android (\d+).?(\d+)?.?(\d+)?/i,
  AndroidNative: /phh_android_version/i,
  IosNative: /phh_ios_version/i,
  Mobile: /Android|webOS|iPhone|iPad|iPod/i,
  AndroidNativeVersion: /(phh_android_version)\/([^\s]+)\s*/i,
  IosNativeVersion: /(phh_ios_version|AppVersion)\/([^\s]+)\s*/i,
  MecoWebViewCore: /MecoCore\/(\d)/i,
  MecoWebViewSdk: /MecoSDK\/(\d)/i,
};

const WECHATPLATFORM = {
  WeChatAndroid: "wechat_android",
  WeChatIOS: "wechat_ios",
  WeChatUnknown: "wechat_unknown",
};

export const getWechatPlatform = (ua = "") => {
  ua = ua.toUpperCase();
  if (ua.indexOf("ANDROID") !== -1) {
    return WECHATPLATFORM.WeChatAndroid;
  }
  if (
    ua.indexOf("IPHONE") !== -1 ||
    ua.indexOf("IPAD") !== -1 ||
    ua.indexOf("ITOUCH") !== -1
  ) {
    return WECHATPLATFORM.WeChatIOS;
  }
  return WECHATPLATFORM.WeChatUnknown;
};

export const isMiniProgram = (ua = "") => {
  return (
    REG.MiniProgram.test(ua) ||
    (typeof window !== "undefined" &&
      window.__wxjs_environment === "miniprogram")
  );
};

const getPlatformByUa = (ua = "") => {
  if (REG.AndroidNative.test(ua)) {
    return PLATFORM.Android;
  }
  if (REG.IosNative.test(ua)) {
    return PLATFORM.IOS;
  }
  if (REG.WeChat.test(ua)) {
    // 如果含有miniprogram为小程序
    return isMiniProgram(ua) ? PLATFORM.WxApp : PLATFORM.WeChat;
  }
  if (REG.Weibo.test(ua)) {
    return PLATFORM.Weibo;
  }
  if (REG.QQApp.test(ua) && isMiniProgram(ua)) {
    return PLATFORM.QQApp;
  }
  if (REG.QQAndQzone.test(ua)) {
    return PLATFORM.QQ;
  }
  return PLATFORM.Unknown;
};

export class Platform {
  _ua: string;
  _cache: Map<string, any>;
  constructor(ua: string) {
    this._ua = ua;
    this._cache = new Map();
  }

  getCache(key: string, lazyCache: (...args: any) => any) {
    if (this._cache.has(key)) {
      return this._cache.get(key);
    }
    const cache = lazyCache();
    this._cache.set(key, cache);
    return cache;
  }

  get platform(): string {
    return getPlatformByUa(this._ua);
  }

  get isNativePlatform() {
    return this.platform === PLATFORM.Android || PLATFORM.IOS;
  }

  get isAndroidNativePlatform() {
    return this.platform === PLATFORM.Android;
  }

  get isIOSNativePlatform() {
    return this.platform === PLATFORM.IOS;
  }

  /**
   * 是否QQ平台包含小程序
   */
  get isQQPlatform() {
    return this.platform === PLATFORM.QQ || this.platform === PLATFORM.QQApp;
  }

  /**
   * 是否QQ平台不包含小程序
   */
  get isPureQQPlatform() {
    return this.platform === PLATFORM.QQ;
  }

  /**
   * 是否QQ小程序平台
   */
  get isQQMiniProgram() {
    return this.platform === PLATFORM.QQApp;
  }

  get isWeiboPlatform() {
    return this.platform === PLATFORM.Weibo;
  }

  get wechatPlatform() {
    return this.getCache("wechatPlatform", () => getWechatPlatform(this._ua));
  }

  /**
   * 是否微信平台不包含小程序
   */
  get isPureWeChatPlatform() {
    return this.platform === PLATFORM.WeChat;
  }

  /**
   * 是否微信小程序平台
   */
  get isWeChatMiniProgram() {
    return this.platform === PLATFORM.WxApp;
  }

  /**
   * 是否微信平台包含小程序
   */
  get isWeChatPlatform() {
    return (
      this.platform === PLATFORM.WeChat || this.platform === PLATFORM.WxApp
    );
  }

  get isAndroidWeChatPlatform() {
    return (
      this.isWeChatPlatform &&
      this.wechatPlatform === WECHATPLATFORM.WeChatAndroid
    );
  }

  get isIOSWeChatPlatform() {
    return (
      this.isWeChatPlatform && this.wechatPlatform === WECHATPLATFORM.WeChatIOS
    );
  }
}
