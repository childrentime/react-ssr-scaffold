import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import { hydrate } from "react-dom";
import { AppComponent } from "./appProvider";

const element = document.getElementById("main")!;
export const clientController = async (page: AppComponent) => {
  const isSSR = window.__SSR__;

  const [initialProps] = await retrieveClientProps(page);

  const Component = page.Component;

  const app = (
    <StrictMode>
      <Component {...initialProps} />
    </StrictMode>
  );

  if (isSSR) {
    hydrateRoot(element, app);

    // 在这里选择性水合 island架构
    hydrate(app, element);
    return;
  }

  const root = createRoot(element);
  root.render(app);
};

async function retrieveClientProps(page: AppComponent) {
  const getInitialProps = () => {
    const initialProps = window.__INITIAL_PROPS__ || window.rawData;
    if (initialProps) {
      return Promise.resolve(initialProps);
    }

    return typeof page.getInitialProps === "function"
      ? page.getInitialProps()
      : Promise.resolve({});
  };

  const initialPropsP = getInitialProps();
  return Promise.all([initialPropsP]);
}
