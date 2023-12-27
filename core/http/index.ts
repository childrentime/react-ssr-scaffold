import { createClientAxios } from "./client";
import { createServerAxios } from "./server";

export const createDefaultAxios = process.env.BROWSER
  ? createClientAxios
  : createServerAxios;
