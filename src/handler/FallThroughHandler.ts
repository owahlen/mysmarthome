import {getNamespace, Handler, resolveResponse} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";

class FallThroughHandler implements Handler {
    canHandle(event: any, context: any): boolean {
        // this handler applies if no other handler could handle the directive
        return true;
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        const namespace = getNamespace(event);
        const responseOpts = {
            "name": "ErrorResponse",
            "payload": {
                "type": "INTERNAL_ERROR",
                "message": "Unknown namespace '" + namespace + "'"
            }
        };

        return resolveResponse(new AlexaResponse(responseOpts));
    }
}

export const fallThroughHandler = () => new FallThroughHandler();
