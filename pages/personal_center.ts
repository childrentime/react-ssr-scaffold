import PersonalCenter from "../app/PersonalCenter/index";
import { createPage } from "../core/store/appProvider";

export const page = createPage(PersonalCenter);

export const startClient = () => {
  // @ts-ignore
  return runClient(PersonalCenter);
};
