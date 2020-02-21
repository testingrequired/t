import fs from "fs";
import { promisify } from "util";
import { Config } from "./Config";

export default async function getTrcConfig(trcPath: string): Promise<Config> {
  if (!(await promisify(fs.exists)(trcPath))) return {};

  return JSON.parse(
    await promisify(fs.readFile)(trcPath, { encoding: "utf8" })
  );
}
