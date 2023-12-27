import express from "express";

import { createDefaultAxios } from "../http/index";
import { getPlatform } from "../platform/index";

export const createServerContext = (
  req: express.Request,
  res: express.Response
) => {
  const $axiosHttp = createDefaultAxios({
    req,
    res,
  });

  return {
    get __req() {
      return req;
    },

    get __res() {
      return res;
    },

    get pathname() {
      return req.baseUrl + req.path;
    },

    get query() {
      return { ...req.query };
    },

    get userAgent() {
      return req.get("User-Agent") || "";
    },

    get hostname() {
      return req.hostname;
    },

    get cookies() {
      return { ...req.cookies };
    },

    get platform() {
      return getPlatform(req.get("User-Agent") || "");
    },

    get $axiosHttp() {
      return $axiosHttp;
    },

    getHeader(key: string) {
      return req.get(key);
    },
  };
};

export type AppServerContext = ReturnType<typeof createServerContext>;
