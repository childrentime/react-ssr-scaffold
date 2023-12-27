import { Platform } from "./platform";

const cachedPlatformByUa = new Map<string, Platform>();
const cachedUA: string[] = [];

const cachePlatformByUa = (ua: string, platform: Platform) => {
  cachedUA.push(ua);
  cachedPlatformByUa.set(ua, platform);
  if (cachedUA.length > 10) {
    const uaForRemove = cachedUA.shift();
    cachedPlatformByUa.delete(uaForRemove!);
  }
};

export const getPlatform = (ua = ""): Platform => {
  if (cachedPlatformByUa.has(ua)) {
    return cachedPlatformByUa.get(ua)!;
  }
  const platformInstance = new Platform(ua);
  cachePlatformByUa(ua, platformInstance);
  return platformInstance;
};

export const getCurrentPlatform = () => {
  if (!process.env.BROWSER) {
    console.warn("该方法支持在浏览器端调用");
    return;
  }
  const currentUA = window.navigator.userAgent;
  return getPlatform(currentUA);
};
