import * as fs from "fs";

export const loadJson = (path: string): any => {
    const jsonString = fs.readFileSync(path, 'utf8');
    return JSON.parse(jsonString);
};
