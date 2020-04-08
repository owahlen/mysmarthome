import {logger} from "./logger";

export const getenv = (key: string): string => {
    let value = process.env[key];
    if (!value) {
        const errorMessage = "unable to retrieve variable '" + key + "' from environment";
        logger.error(errorMessage);
        throw Error(errorMessage);
    }
    return value;
};
