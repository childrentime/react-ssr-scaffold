import { create } from "./create";
import { retrieveData } from "./plugin";
import express from "express";

export const createServerAxios = ({
  req,
  res,
}: {
  req: express.Request;
  res: express.Response;
}) => {
  const { http, usePlugins } = create({
    baseURL: getBaseURL(),
    timeout: 1200,
    headers: {},
  });

  const plugins = [retrieveData()];

  usePlugins(plugins);
  return http;
};

const getBaseURL = () => {
  return "http://localhost:8080";
};
