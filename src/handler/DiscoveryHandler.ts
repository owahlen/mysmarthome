import {Handler} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";
import {getIotTransceiver} from "../iot/IotRadioFactory";
import {IotRequest} from "../iot/IotRequest";
import {IotResponse} from "../iot/IotResponse";
import {AlexaEndpoint} from "../alexa/AlexaEndpoint";


class DiscoveryHandler extends Handler {
    canHandle(event: any, context: any): boolean {
        return this.getNamespace(event) === 'Alexa.Discovery';
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        const iotRequest: IotRequest = {
            // endpointId is not defined -> broadcast
            payload: {directive: event.directive}
        }
        const iotTransceiver = getIotTransceiver();
        const iotResponses: Array<IotResponse> = await iotTransceiver.get(iotRequest);

        const alexaResponse = new AlexaResponse({
                namespace: "Alexa.Discovery",
                name: "Discover.Response"
            }
        );
        iotResponses.forEach((iotResponse) => {
            const alexaEndpoint: AlexaEndpoint = iotResponse.payload;
            alexaResponse.addPayloadEndpoint(alexaEndpoint);
        });
        return this.resolveResponse(alexaResponse);
    }
}

export const discoveryHandler = () => new DiscoveryHandler();
