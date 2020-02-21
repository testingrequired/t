import fs from "fs";
import { promisify } from "util";
import TrcFile from "./TrcFile";

export default async function getTrcConfig(trcPath: string): Promise<TrcFile> {
  if (!(await promisify(fs.exists)(trcPath))) return {};

  return JSON.parse(
    await promisify(fs.readFile)(trcPath, { encoding: "utf8" })
  );
}
