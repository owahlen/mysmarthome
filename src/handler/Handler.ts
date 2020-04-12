import {AlexaResponse} from "../alexa/AlexaResponse";
import {logger} from "../utils/logger";

export interface Handler {
    canHandle(event: any, context: any): boolean;

    handle(event: any, context: any): Promise<AlexaResponse>;
}

export const getNamespace = (event: any): string => ((event.directive || {}).header || {}).namespace;

export const resolveResponse = (response: AlexaResponse): Promise<AlexaResponse> => {
    logger.info("----- response -----");
    logger.info(JSON.stringify(response));
    return Promise.resolve(response);
};
