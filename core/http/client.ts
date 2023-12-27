import { create } from "./create";
import { retrieveData } from "./plugin";

export const createClientAxios = () => {
  const { http, usePlugins } = create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {},
  });

  const plugins = [retrieveData()];

  usePlugins(plugins);
  return http;
};

const getBaseURL = () => {
  const protocol = location.protocol;
  const proxyBase = protocol + "//" + location.host + "/proxy/api/";
  return proxyBase;
};
