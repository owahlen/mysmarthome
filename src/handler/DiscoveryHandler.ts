import {getNamespace, Handler, resolveResponse} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";
import {getIotTransceiver} from "../iot/IotRadioFactory";
import {IotRequest} from "../iot/IotRequest";
import {IotResponse} from "../iot/IotResponse";
import {AlexaEndpoint} from "../alexa/AlexaEndpoint";


class DiscoveryHandler implements Handler {
    canHandle(event: any, context: any): boolean {
        return getNamespace(event) === 'Alexa.Discovery';
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        const alexaResponse = new AlexaResponse({
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response"
            }
        );
        const iotRequest: IotRequest = {
            // endpointId is not defined -> broadcast
            payload: {event}
        }
        const iotTransceiver = getIotTransceiver();
        const iotResponses: Array<IotResponse> = await iotTransceiver.get(iotRequest);
        iotResponses.forEach((iotResponse) => {
            const alexaEndpoint: AlexaEndpoint = iotResponse.payload;
            alexaResponse.addPayloadEndpoint(alexaEndpoint);
        });
        return resolveResponse(alexaResponse);
    }
}

export const discoveryHandler = () => new DiscoveryHandler();
