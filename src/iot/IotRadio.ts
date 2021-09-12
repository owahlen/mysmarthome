import { uuid } from "../utils/idGeneration";

/**
 * Base class for transmitters and receivers of iot data
 */
export class IotRadio {

    endpoint: string;
    baseTopic: string;

    constructor(endpoint: string, baseTopic: string) {
        this.endpoint = endpoint;
        this.baseTopic = baseTopic;
    }

    protected createRequestId(): string {
        return uuid();
    }

    protected getRequestTopic(requestId: string): string {
        return this.baseTopic + '/request/' + requestId
    }

}
