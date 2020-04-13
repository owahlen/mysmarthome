import {Handler} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";
import {logger} from "../utils/logger";

class AuthorizationHandler extends Handler {

    canHandle(event: any, context: any): boolean {
        const namespace = this.getNamespace(event);
        const name = this.getName(event)
        return namespace === 'Alexa.Authorization' && name === 'AcceptGrant';
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        let responseOpts = {
            "namespace": "Alexa.Authorization",
            "name": "AcceptGrant.Response",
        };
        const alexaResponse = new AlexaResponse((responseOpts))
        logger.info("----- response -----");
        logger.info(JSON.stringify(alexaResponse));
        return Promise.resolve(alexaResponse);
    }

}

export const authorizationHandler = () => new AuthorizationHandler();
