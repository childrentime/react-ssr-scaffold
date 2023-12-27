import { getConfig } from "../server/runtime.config";
import NormalizeRem from "./NormalizeRem";
import RafScript from "./RafScript";

export const Header = ({
  assets,
  pageModuleId,
  context,
}: {
  assets: {
    js: any[];
    css: any[];
  };
  pageModuleId: string;
  context: any;
}) => {
  const { css, js } = assets;
  const links = css.map((href, index) => (
    <link key={index} rel="stylesheet" href={href} />
  ));
  const scripts = <RafScript scripts={js} context={context} />;
  const { pages } = getConfig()!;
  const page = pages[pageModuleId];
  return (
    <>
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover"
      />
      <meta name="format-detection" content="telephone=no" />
      <meta
        httpEquiv="Cache-Control"
        content="no-cache,no-store,must-revalidate"
      />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
      <title>{page?.Component?.appConfig?.title || "TODOS"}</title>
      {links}
      {scripts}
      <NormalizeRem context={context} />
    </>
  );
};
