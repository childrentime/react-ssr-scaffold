/**
 * runtime.config.ts 运行时配置
 *
 */

import { AppComponent, AppComponentClass } from "../core/store/appProvider";

export interface IRunTimeConfig {
  assets: Record<
    string,
    {
      js: string[] | string;
      css: string[] | string;
    }
  >;
  pages: Record<string, AppComponent>;
  layouts: {
    Header: (props: {
      assets: {
        js: any[];
        css: any[];
      };
      pageModuleId: string;
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

let config: IRunTimeConfig | null = null;

export const getConfig = () => config;

export const setConfig = (value: IRunTimeConfig) => {
  config = value;
};
