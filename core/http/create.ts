import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export interface RequestConfig extends AxiosRequestConfig {
  useRawResponse?: boolean;
}

//@ts-ignore
export interface RawResponse extends AxiosResponse {
  config: RequestConfig;
}

export const create = (config: RequestConfig) => {
  const http = axios.create(config);

  return {
    http,
    usePlugins: (plugins: AxiosPlugin[]) => usePlugins(http, plugins),
  };
};

export interface AxiosPlugin {
  request?: any;
  requestError?: any;
  response?: any;
  responseError?: any;
}

const usePlugins = (http: AxiosInstance, plugins: AxiosPlugin[]) => {
  plugins.map((plugin) => {
    const request = http.interceptors.request.use(
      plugin.request,
      plugin.requestError
    );
    const response = http.interceptors.response.use(
      plugin.response,
      plugin.responseError
    );

    return { request, response };
  });
};
