import {Handler, resolveResponse} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";

class ValidationHandler implements Handler {
    canHandle(event: any, context: any): boolean {
        return !('directive' in event) || event.directive.header.payloadVersion !== '3';
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        let responseOpts = {
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "Internal error processing the event"
            }
        };

        if (!('directive' in event)) {
            // Validate this is an Alexa directive
            responseOpts.payload.type = "INVALID_DIRECTIVE";
            responseOpts.payload.message = "The Alexa event is missing the key 'directive'.";
        } else if (event.directive.header.payloadVersion !== '3') {
            // Validate the payload version
            responseOpts.payload.message = "This skill only supports Smart Home API version 3.";
        }

        return resolveResponse(new AlexaResponse(responseOpts));
    }
}

export const validationHandler = () => new ValidationHandler();
