import express from "express";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { AppComponent } from "../core/store/appProvider";
import serialize from "serialize-javascript";
import { INITIAL_PROPS_LOADED } from "../core/store/common";

const hasOwnProperty = Object.prototype.hasOwnProperty;
const PADDING_EL = '<div style="height: 0">' + "\u200b".repeat(300) + "</div>";
const HEAD_CLOSE_HTML = `</head><body>${PADDING_EL}<div id="main">`;

interface IPageProps {
  pageModuleId: string;
  page: AppComponent;
  assets: {
    js: any[];
    css: any[];
  };
  layouts: {
    Header: (props: {
      assets: {
        js: any[];
        css: any[];
      };
      pageModuleId: string;
      context: any;
    }) => JSX.Element;
    Footer: (props: {
      assets: {
        js: any[];
        css: any[];
      };
      pageModuleId: string;
    }) => JSX.Element | null;
  };
}

export const createPageHandler = ({
  page,
  assets,
  pageModuleId,
  layouts,
}: IPageProps) => {
  return async (req: express.Request, res: express.Response) => {
    const { getInitialProps } = page;
    const { renderCSR, writeTopPart, writeBottomPart, writeContent } =
      createRender({
        page,
        assets,
        pageModuleId,
        layouts,
      });
    if (hasOwnProperty.call(req.query, "__csr")) {
      return renderCSR(req, res);
    }
    const dataP = getInitialProps(req.$context).catch((e) => {
      e.message = "page.getInitialProps 失败: " + e.message;
      throw e;
    });

    await writeTopPart(req, res);

    try {
      const [props] = await Promise.all([dataP]).catch((e) => {
        res.write(`${HEAD_CLOSE_HTML}</div>`);
        throw e;
      });
      await writeContent(req, res, {
        assets,
        props,
        pageModuleId,
      });
    } catch (e) {
      console.log(req, e);
    } finally {
      writeBottomPart(req, res);
    }
  };
};

const createRender = ({ page, assets, pageModuleId, layouts }: IPageProps) => {
  const { Header, Footer } = layouts;
  const { Component } = page;

  const renderHeader = (req: express.Request) => {
    return renderToStaticMarkup(
      <Header
        assets={assets}
        pageModuleId={pageModuleId}
        context={req.$context}
      />
    );
  };

  const renderFooter = (req: express.Request) => {
    if (!Footer) {
      return "";
    }
    return renderToStaticMarkup(
      <Footer assets={assets} pageModuleId={pageModuleId} />
    );
  };

  return {
    renderCSR(req: express.Request, res: express.Response) {
      res.set({ "Content-Type": "text/html; charset=UTF-8" });
      res.end(
        `<!DOCTYPE html><html lang="zh-Hans"><head>${renderHeader(
          req
        )}</head><body><div id="main"></div>${renderFooter(req)}</body></html>`
      );
    },

    writeTopPart: async (req: express.Request, res: express.Response) => {
      res.set({
        "X-Accel-Buffering": "no",
        "Content-Type": "text/html; charset=UTF-8",
      });

      res.write(
        `<!DOCTYPE html><html lang="zh-Hans"><head>${renderHeader(req)}`
      );
      res.flushHeaders();
    },

    writeBottomPart: (req: express.Request, res: express.Response) =>
      res.end(`${renderFooter(req)}</body></html>`),

    writeContent: async (
      req: express.Request,
      res: express.Response,
      contentOptions: any
    ) => {
      const { props } = contentOptions;
      try {
        const app = <Component {...props} />;
        const content = renderToString(app);
        res.write(`${HEAD_CLOSE_HTML}${content}</div>`);
      } catch (e) {
        console.log(req, e, "renderContent 失败");
        res.write(`${HEAD_CLOSE_HTML}</div>`);
      }
      res.write(getRawDataChunk(req, props));
    },
  };
};

const getRawDataChunk = (req: express.Request, data: any) => {
  try {
    data = serialize(data, { isJSON: true });
  } catch (e) {
    console.log(req, e, "序列化 data 失败");
    data = null;
  }
  return `<script>window.__SSR__=1;window.__CHUNK_DATA__={};window.rawData=${data};document.dispatchEvent(new Event('${INITIAL_PROPS_LOADED}'));</script>`;
};
