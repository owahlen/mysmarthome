import {getNamespace, Handler, resolveResponse} from "./Handler";
import {AlexaResponse} from "./AlexaResponse";

class AuthorizationHandler implements Handler {
    canHandle(event: any, context: any): boolean {
        return getNamespace(event) === 'Alexa.Authorization';
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        let responseOpts = {
            "namespace": "Alexa.Authorization",
            "name": "AcceptGrant.Response",
        };
        return resolveResponse(new AlexaResponse(responseOpts));
    }

}

export const authorizationHandler = () => new AuthorizationHandler();
