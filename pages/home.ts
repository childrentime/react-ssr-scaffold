import Home from "../app/Home/";
import { createPage } from "../core/store/appProvider";
import { runClient } from "../core/store/index";

export const page = createPage(Home);

export const startClient = () => {
  // @ts-ignore
  return runClient(Home);
};
