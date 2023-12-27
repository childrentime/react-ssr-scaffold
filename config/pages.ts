import fs from "fs-extra";
import path from "path";
import { CLIENT_DIR, entryPath, LAYOUTS_DIR, PAGE_DIR, TEMP } from "./constant";

const pageEntries = fs.readdirSync(PAGE_DIR).reduce((entry, filename) => {
  if (filename.match(/\.(js|jsx|ts|tsx)$/)) {
    const pageName = filename.slice(0, filename.lastIndexOf("."));
    const pathName = path.resolve(PAGE_DIR, filename).replace(/\\/g, "\\\\");
    entry[pageName] = pathName;
  }

  console.log("entry", entry);
  return entry;
}, {} as Record<string, string>);

export const getExt = (str: string) => {
  const len = str.lastIndexOf(".");
  return str.slice(len, str.length);
};

const getClientEntries = () => {
  fs.removeSync(CLIENT_DIR);
  fs.mkdirSync(CLIENT_DIR, { recursive: true });
  const clientControllerPath = path.resolve(
    __dirname,
    "../core/store/clientController.tsx"
  );
  return Object.entries(pageEntries).reduce(
    (clientEntries, [pageName, modulePath]) => {
      const ext = getExt(modulePath);
      const pageEntry = path.resolve(CLIENT_DIR, pageName + ext);
      const entryStr =
        `import { startClient, page } from '${modulePath}';\nimport { clientController } from '${clientControllerPath}';\n` +
        `Promise.resolve(typeof startClient === 'function' && startClient()).then(() => clientController(page));`;
      fs.writeFileSync(pageEntry, entryStr);
      clientEntries[pageName] = path.resolve(CLIENT_DIR, `${pageName}${ext}`);
      return clientEntries;
    },
    {} as Record<string, string>
  );
};

const getServerEntry = () => {
  const getPagesStr = () => {
    const importStr =
      Object.entries(pageEntries).reduce((result, [pageName, modulePath]) => {
        return (
          result + `import { page as ${pageName} } from '${modulePath}';\n`
        );
      }, "") + "\n";

    const pageNames = Object.keys(pageEntries);
    const exportStr = `const pages = { ${pageNames.join(", ")} };\n\n`;

    return { importStr, exportStr };
  };
  const getRuntimeStr = () => {
    const assetsStr = `const assets = __non_webpack_require__('../webpack-assets.json');\n\n`;
    return {
      importStr: `import { setConfig } from '${path.resolve(
        __dirname,
        "../server/runtime.config.ts"
      )}';\n\n`,
      runStr: assetsStr + "setConfig({ pages, assets, layouts });\n",
    };
  };

  const getLayoutStr = () => {
    const headerPath = path
      .resolve(LAYOUTS_DIR, "Header")
      .replace(/\\/g, "\\\\");
    const footerPath = path
      .resolve(LAYOUTS_DIR, "Footer")
      .replace(/\\/g, "\\\\");

    let importStr = `import { Header } from '${headerPath}';\n`;
    let exportStr = `const layouts = { Header };`;
    if (fs.pathExistsSync(footerPath)) {
      importStr += `import { Footer } from '${footerPath}';\n`;
      exportStr = `const layouts = { Header, Footer };`;
    }

    return {
      importStr: importStr + "\n",
      exportStr: exportStr + "\n\n",
    };
  };

  const pageStr = getPagesStr();
  const runtimeStr = getRuntimeStr();
  const layoutStr = getLayoutStr();

  const entryStr =
    pageStr.importStr +
    layoutStr.importStr +
    runtimeStr.importStr +
    pageStr.exportStr +
    layoutStr.exportStr +
    runtimeStr.runStr;

  fs.mkdirSync(TEMP, { recursive: true });

  fs.writeFileSync(entryPath, entryStr);

  return entryPath;
};

export { getClientEntries, pageEntries, getServerEntry };
