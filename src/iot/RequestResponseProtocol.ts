import {logger} from "../logger";
import * as awsIot from "aws-iot-device-sdk";
import * as uuid from "uuid";
import {IotResponse} from "./IotResponse";

export const RESPONSE_TIME_MS = 10000;

export class RequestResponseProtocol {
    iotEndpoint: string;
    baseTopic: string;
    device: awsIot.device;
    subscribers: Map<string, (topic: string, payload: any) => void>;

    constructor(iotEndpoint: string, baseTopic: string) {
        this.iotEndpoint = iotEndpoint;
        this.baseTopic = baseTopic;

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
            const payload = JSON.parse(payloadBuffer);
            const requestId = topic.substring(topic.lastIndexOf('/') + 1, topic.length);
            const subscriber = this.subscribers.get(requestId);
            if (subscriber) {
                subscriber(topic, payload);
            } else {
                logger.warn("no subscriber for message on topic '" + topic + "': " + JSON.stringify(payload));
            }
            this.subscribers.delete(requestId);
        });

        this.device.on("error", (error: Error | string) => {
            logger.error(error.toString());
        });

        this.subscribers = new Map();
    }

    async get(payload: any): Promise<IotResponse> {

        const requestId = uuid.v4();
        const requestTopic = this.baseTopic + '/request/' + requestId;

        const promise = new Promise<IotResponse>((resolve, reject) => {
            let isPending = true;
            this.subscribers.set(requestId, (topic: string, payload: any) => {
                logger.info("received response on topic '" + topic + "': " + JSON.stringify(payload));
                if (payload.status === "OK") {
                    resolve({requestId, payload});
                } else {
                    const errorMessage = "device has returned status: " + payload.status;
                    logger.warn(errorMessage);
                    reject(Error(errorMessage));
                }
                isPending = false;
            });
            setTimeout(() => {
                if (isPending) {
                    const errorMessage = "timeout waiting more than " + RESPONSE_TIME_MS + " ms for response from device";
                    logger.warn(errorMessage);
                    isPending = false;
                    reject(Error(errorMessage));
                }
            }, RESPONSE_TIME_MS);
        });

        await this.publish(requestTopic, payload);

        return promise;
    }

    end() {
        this.device.end();
    }

    async publish(topic: string, payload: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const payloadJson = JSON.stringify(payload);
            this.device.publish(topic, payloadJson, {qos: 0}, (error?: Error) => {
                if (error) {
                    logger.error("error publishing event: " + JSON.stringify(error));
                    reject(error);
                } else {
                    logger.info("published payload on topic '" + topic + "': " + JSON.stringify(payload));
                    resolve();
                }
            });
        });
    }

}

export const requestResponseProtocol = (iotEndpoint: string, baseTopic: string) => new RequestResponseProtocol(iotEndpoint, baseTopic);
