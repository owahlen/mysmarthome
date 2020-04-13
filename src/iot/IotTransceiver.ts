import {logger} from "../utils/logger";
import * as awsIot from "aws-iot-device-sdk";
import {IotResponse} from "./IotResponse";
import {IotRequest} from "./IotRequest";
import {IotRadio} from "./IotRadio";

export const RESPONSE_TIME_MS = 4000;

/**
 * Representation of a bidirectional transceiver that works on top of aws-iot-core's pub/sub.
 */
export class IotTransceiver extends IotRadio {
    device: awsIot.device;
    subscribers: Map<string, (topic: string, payload: any) => void>;

    /**
     * Construct an IotTransmitter
     * @param iotEndpoint aws iot core endpoint
     * @param baseTopic to be used for all pub/sub conversations
     */
    constructor(iotEndpoint: string, baseTopic: string) {
        super(iotEndpoint, baseTopic);

        this.subscribers = new Map();

        this.device = new awsIot.device({
            host: iotEndpoint,
            protocol: 'wss'
        });

        this.device.on('connect', () => {
            logger.info("connected to iot endpoint '" + iotEndpoint + "'");
            const responseTopic = this.baseTopic + '/response/+';
            this.device.subscribe(responseTopic, {qos: 0}, (error) => {
                if (error) {
                    logger.error("unable to subscribe to topic '" + responseTopic + "'");
                } else {
                    logger.info("subscribed to topic '" + responseTopic + "'");
                }
            });
        });

        this.device.on('message', (topic: string, payloadBuffer: any) => {
            const iotResponse = JSON.parse(payloadBuffer) as IotResponse;
            const requestId = topic.substring(topic.lastIndexOf('/') + 1, topic.length);
            const subscriber = this.subscribers.get(requestId);
            if (subscriber) {
                subscriber(topic, iotResponse);
            } else {
                logger.warn("no subscriber for message on topic '" + topic + "': " + JSON.stringify(iotResponse));
            }
        });

        this.device.on("error", (error: Error | string) => {
            logger.error(error.toString());
        });
    }

    /**
     * Send an IotRequest over the iot connection to one or all endpoint(s)
     * and return the response of all addressed endpoints in the array of IotResponses.
     *
     * @param iotRequest to be sent to the endpoint
     */
    async get(iotRequest: IotRequest): Promise<Array<IotResponse>> {

        const requestId = this.createRequestId();
        const requestTopic = this.getRequestTopic(requestId);

        const promise = new Promise<Array<IotResponse>>((resolve, reject) => {
            const responses = new Array<IotResponse>();
            this.subscribers.set(requestId, (topic: string, iotResponse: IotResponse) => {
                // this function is called everytime a response is received from any endpoint
                logger.info("received response from endpoint '" + iotResponse.iotEndpointId +
                    "' on topic '" + topic + "': " + JSON.stringify(iotResponse.payload));
                if (iotResponse.error === undefined) {
                    responses.push(iotResponse);
                    if (iotRequest.endpointId) {
                        // a successful response has arrived from the addressed endpoint.
                        // Thus the promise can be resolved.
                        this.subscribers.delete(requestId);
                        resolve(responses);
                    }
                } else {
                    const errorMessage = "endpoint '" + iotResponse.iotEndpointId +
                        "' has returned error: " + iotResponse.error;
                    logger.warn(errorMessage);
                    this.subscribers.delete(requestId);
                    reject(Error(errorMessage));
                }
            });
            setTimeout(() => {
                if (!iotRequest.endpointId) {
                    // broadcasts are normally resolved in the timeout
                    this.subscribers.delete(requestId);
                    resolve(responses);
                } else if (this.subscribers.has(requestId)) {
                    // the addressed endpoint was not resolved in time
                    const errorMessage = "timeout waiting more than " + RESPONSE_TIME_MS +
                        " ms for response from endpoint '" + iotRequest.endpointId + "'";
                    logger.warn(errorMessage);
                    this.subscribers.delete(requestId);
                    reject(Error(errorMessage));
                }
            }, RESPONSE_TIME_MS);
        });
        await this.publish(requestTopic, iotRequest);
        return promise;
    }

    /**
     * Close the transceiver and any underlying connections
     * @param force passing it to true will close the client right away, without waiting for the in-flight messages to be acked.
     * @param callback
     */
    end(force?: boolean, callback?: Function) {
        this.device.end(force, callback);
    }

    /**
     * Publish the IotRequest on the given topic.
     * In case of an error while publishing the result promise is rejected.
     * @param topic to be published on
     * @param iotRequest to be published
     */
    private async publish(topic: string, iotRequest: IotRequest): Promise<void> {
        return new Promise((resolve, reject) => {
            const payloadJson = JSON.stringify(iotRequest);
            this.device.publish(topic, payloadJson, {qos: 0}, (error?: Error) => {
                if (error) {
                    logger.error("error publishing event: " + JSON.stringify(error));
                    reject(error);
                } else {
                    logger.info("published payload on topic '" + topic + "': " + JSON.stringify(iotRequest));
                    resolve();
                }
            });
        });
    }

}

export const iotTransceiver = (iotEndpoint: string, baseTopic: string) => new IotTransceiver(iotEndpoint, baseTopic);
