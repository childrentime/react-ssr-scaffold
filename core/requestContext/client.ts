import { getPlatform } from "../platform/index";
import { getCookie, parseQuery } from "../utils/index";

export const createClientContext = () => {
  return {
    get pathname() {
      return location.pathname;
    },

    get query() {
      return parseQuery(location.search);
    },

    get userAgent() {
      return navigator.userAgent;
    },

    get hostname() {
      return location.hostname;
    },

    get cookies() {
      return getCookie();
    },

    get platform() {
      return getPlatform(navigator.userAgent);
    },
  };
};

export type AppClientContext = ReturnType<typeof createClientContext>;
