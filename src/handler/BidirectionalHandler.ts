import {Handler} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";
import {getIotTransceiver} from "../iot/IotRadioFactory";
import {IotRequest} from "../iot/IotRequest";
import {IotResponse} from "../iot/IotResponse";
import {logger} from "../utils/logger";

class BidirectionalHandler extends Handler {

    canHandle(event: any, context: any): boolean {
        const namespace = this.getNamespace(event);
        const isBidirectional = this.isBidirectional(event);
        return namespace !== 'Alexa.Discovery' && isBidirectional;
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        const endpointId = this.getEndpointId(event);
        if (!endpointId) {
            logger.warn("no endpointId found for event: " + JSON.stringify(event));
        }
        const iotRequest: IotRequest = {
            endpointId,
            payload: {directive: event.directive}
        }
        const iotTransceiver = getIotTransceiver();
        const iotResponses: Array<IotResponse> = await iotTransceiver.get(iotRequest);
        if (iotResponses.length !== 1) {
            let errorMessage: string;
            if (iotResponses.length === 0) {
                errorMessage = "Device has sent no response for event: " + JSON.stringify(event);
            } else {
                errorMessage = "The event: " + JSON.stringify(event) +
                    " has returned more than one response: " + JSON.stringify(iotResponses);
            }
            logger.error(errorMessage);
            const responseOpts = {
                name: "ErrorResponse",
                payload: {
                    type: "INTERNAL_ERROR",
                    message: errorMessage
                }
            };
            return this.resolveResponse(new AlexaResponse(responseOpts));
        }
        const iotResponse = iotResponses[0];
        const alexaResponse = new AlexaResponse({
            event: iotResponse.payload.event,
            context: iotResponse.payload.context
        });
        return this.resolveResponse(alexaResponse);
    }
}

export const bidirectionalHandler = () => new BidirectionalHandler();
