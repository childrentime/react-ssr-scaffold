import { Compiler, EntryOptionPlugin, WebpackPluginInstance } from "webpack";
import { clearEntryContent } from "../utils/replaceEntry";

export interface WebpackDemandEntryCompiler extends Compiler {
  compiledEntries: Record<string, any>;
  allEntries: Record<string, any>;
}
export default class WebpackDemandEntryPlugin implements WebpackPluginInstance {
  private options: any;
  constructor(options: any) {
    this.options = {
      pageEntries: {},
      ...options,
    };
  }

  // @ts-expect-error
  apply(compiler: WebpackDemandEntryCompiler) {
    compiler.compiledEntries = {}; // 编译过的路由，一开始为空

    Object.entries(this.options.pageEntries).forEach(([name, path]) => {
      console.log("path", path);
      clearEntryContent(path as string);
    });

    compiler.hooks.entryOption.tap("EntryOptions", (context, entry) => {
      console.log("entry", entry);
      const newEntry = async () => {
        let originEntry = entry;
        if (typeof entry === "function") {
          originEntry = await entry();
        }
        if (!compiler.allEntries) {
          // 初始入口
          compiler.allEntries = originEntry;
        }

        // 基础路由，首次一定要编译的entry
        // 客户端为空 服务端需要编译 server.ts和app.ts
        const baseEntry = Object.entries(originEntry).reduce(
          (all, [key, val]) => {
            if (!this.options.pageEntries[key]) {
              // @ts-expect-error
              all[key] = originEntry[key];
            }
            return all;
          },
          {} as Record<string, any>
        );

        return {
          ...baseEntry,
          ...Object.keys(compiler.compiledEntries).reduce((all, key) => {
            const config = compiler.compiledEntries[key];
            if (config) {
              all[key] = config;
            }
            return all;
          }, {} as Record<string, any>),
        };
      };

      EntryOptionPlugin.applyEntryOption(compiler, context, newEntry);
      return true;
    });
  }
}
