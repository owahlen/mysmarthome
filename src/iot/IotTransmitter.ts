import {IotRequest} from "./IotRequest";
import * as IotData from "aws-sdk/clients/iotdata";
import {IotRadio} from "./IotRadio";
import {logger} from "../utils/logger";

/**
 * Representation of a unidirectional transmitter that works on top of aws-iot-core's pub/sub.
 */
export class IotTransmitter extends IotRadio {

    iotData: IotData;

    /**
     * Construct an IotTransmitter
     * @param iotEndpoint aws iot core endpoint
     * @param baseTopic to be used for all pub/sub conversations
     */
    constructor(iotEndpoint: string, baseTopic: string) {
        super(iotEndpoint, baseTopic);
        this.iotData = new IotData({endpoint: iotEndpoint});
    }

    /**
     * Transmit data to the endpoint(s) defined in the iotRequest.
     * The method rejects the promise in case of an error.
     * @param iotRequest
     */
    async send(iotRequest: IotRequest): Promise<void> {
        const requestId = this.createRequestId();
        const requestTopic = this.getRequestTopic(requestId);
        const params = {
            topic: requestTopic,
            payload: JSON.stringify(iotRequest)
        };
        return new Promise((resolve, reject) => {
            this.iotData.publish(params, (error, res) => {
                if (error) {
                    logger.error("error publishing event: " + JSON.stringify(error));
                    reject(error);
                } else {
                    logger.info("published payload on topic '" + requestTopic + "': " + JSON.stringify(iotRequest));
                    resolve();
                }
            });
        });
    }

}

export const iotTransmitter = (iotEndpoint: string, baseTopic: string) => new IotTransmitter(iotEndpoint, baseTopic);
