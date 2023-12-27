import fs from "fs";
import { entryPath } from "../constant";

const escape = (path: string) =>
  path.replace(/\\/g, "\\\\").replace(/\//g, "\\/").replace(/\./g, "\\.");

// import 改为 const
export function clearEntryContent(filePath: string) {
  const entryContent = fs.readFileSync(entryPath).toString();
  const reg = new RegExp(
    "(?:^|\n)(import\\s+\\{\\s+page\\s+as\\s+(\\w+)\\s+\\}\\s+from\\s+'" +
      escape(filePath) +
      "';)",
    "g"
  );
  fs.writeFileSync(
    entryPath,
    entryContent.replace(reg, (all, main, name) => {
      return `\n// ${main}\nconst ${name} = {};`;
    })
  );
}

// import 注释恢复 删除const
export function recoverEntryContent(filePath: string) {
  const entryContent = fs.readFileSync(entryPath).toString();
  // 匹配import语句中的别名
  const reg = new RegExp(
    "\\/\\/\\s+import\\s+\\{\\s+page\\s+as\\s+(\\w+)\\s+\\}\\s+from\\s+'" +
      escape(filePath) +
      "';"
  );
  let moduleName;
  const newContent = entryContent
    .replace(reg, (all, name) => {
      moduleName = name;
      return all.replace(/^\/\/\s+/, "");
    })
    .replace(`const ${moduleName} = {};`, "");
  fs.writeFileSync(entryPath, newContent);
}
