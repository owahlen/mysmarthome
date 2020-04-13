import {Handler} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";
import {getIotTransceiver} from "../iot/IotRadioFactory";
import {IotRequest} from "../iot/IotRequest";
import {IotResponse} from "../iot/IotResponse";
import {AlexaEndpoint} from "../alexa/AlexaEndpoint";
import {logger} from "../utils/logger";


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

        const iotResponsesPromise : Promise<Array<IotResponse>> = iotTransceiver.get(iotRequest)
        return iotResponsesPromise.then((iotResponses) => {
            const alexaResponse = new AlexaResponse({
                    namespace: "Alexa.Discovery",
                    name: "Discover.Response"
                }
            );
            iotResponses.forEach((iotResponse) => {
                const alexaEndpoint: AlexaEndpoint = iotResponse.payload;
                alexaResponse.addPayloadEndpoint(alexaEndpoint);
            });
            logger.info("----- response -----");
            logger.info(JSON.stringify(alexaResponse));
            return alexaResponse;
        });
    }
}

export const discoveryHandler = () => new DiscoveryHandler();
