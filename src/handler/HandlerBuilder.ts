import {Handler} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";
import {logger} from "../utils/logger";

export class HandlerBuilder {

    // noinspection JSMismatchedCollectionQueryUpdate
    private handlers: Array<Handler> = [];

    add(handler: Handler): HandlerBuilder {
        this.handlers.push(handler);
        return this;
    };

    build(): (event: any, context: any) => Promise<AlexaResponse> {
        return (event: any, context: any): Promise<AlexaResponse> => {
            const handlerIndex = this.handlers.findIndex(it => it.canHandle(event, context));
            if (handlerIndex < 0) {
                const errorMessage = "unable to handle event: " + JSON.stringify(event);
                logger.error(errorMessage);
                return Promise.reject(errorMessage);
            }
            return this.handlers[handlerIndex].handle(event, context);
        };
    }
}

export const handlerBuilder = () => new HandlerBuilder();

