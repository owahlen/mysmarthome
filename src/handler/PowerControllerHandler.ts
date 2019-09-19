import {getNamespace, Handler, resolveResponse} from "./Handler";
import {AlexaResponse} from "./AlexaResponse";
import {Key} from "../key";
import {publishKey} from "../iot/iot";

class PowerControllerHandler implements Handler {
    canHandle(event: any, context: any): boolean {
        return getNamespace(event) === 'Alexa.PowerController';
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        const endpointId = event.directive.endpoint.endpointId;
        const token = event.directive.endpoint.scope.token;
        const correlationToken = event.directive.header.correlationToken;

        const alexaResponse = new AlexaResponse(
            {
                "correlationToken": correlationToken,
                "token": token,
                "endpointId": endpointId
            }
        );
        const powerStateValue = event.directive.header.name === "TurnOn" ? "ON" : "OFF";
        alexaResponse.addContextProperty({
            "namespace": "Alexa.PowerController",
            "name": "powerState",
            "value": powerStateValue
        });
        await publishKey(Key.Standby);
        return resolveResponse(alexaResponse);
    }
}

export const powerControllerHandler = () => new PowerControllerHandler();
