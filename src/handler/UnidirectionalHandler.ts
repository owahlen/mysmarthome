import {Handler} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";
import {getIotTransmitter} from "../iot/IotRadioFactory";
import {IotRequest} from "../iot/IotRequest";
import {logger} from "../utils/logger";

class UnidirectionalHandler extends Handler {

    canHandle(event: any, context: any): boolean {
        return !this.isBidirectional(event);
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        const endpointId = this.getEndpointId(event);
        const token = this.getBearerToken(event);
        const correlationToken = this.getCorrelationToken(event);
        if (!endpointId) {
            logger.warn("no endpointId found for event: " + JSON.stringify(event));
        }
        const iotRequest: IotRequest = {
            endpointId,
            payload: {directive: event.directive}
        }
        const iotTransmitter = getIotTransmitter();

        // send the data to iot without waiting for a response
        const iotResponsesPromise: Promise<void> = iotTransmitter.send(iotRequest);
        return iotResponsesPromise.then(() => {
            const alexaResponse = new AlexaResponse(
                {
                    name: 'Response',
                    correlationToken,
                    token,
                    endpointId
                }
            );
            logger.info("----- response -----");
            logger.info(JSON.stringify(alexaResponse));
            return alexaResponse;
        });
    }
}

export const unidirectionalHandler = () => new UnidirectionalHandler();
