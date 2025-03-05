import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import {Anime} from "../Data/json";

export const generateFileWithResults = (json: Anime[], nameOfFile: string): string => {
    const resultsDir = join(__dirname, "../../../results");
    if (!existsSync(resultsDir)) {
        mkdirSync(resultsDir);
    }
    const path = join(resultsDir, `results_${nameOfFile}.json`);
    writeFileSync(path, JSON.stringify(json, null, 2));
    console.log("File generated at:", path);
    return path;
}