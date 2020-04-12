import {AlexaResponse} from "../alexa/AlexaResponse";
import {logger} from "../utils/logger";

export abstract class Handler {

    abstract canHandle(event: any, context: any): boolean;

    abstract handle(event: any, context: any): Promise<AlexaResponse>;

    isBidirectional(event: any): boolean {
        const namespace = this.getNamespace(event);
        const namespaceAndName = namespace + ":" + this.getName(event);
        const bidirectionalDirectives = this.getBidirectionalDirectives(event);
        return bidirectionalDirectives.includes(namespace) || bidirectionalDirectives.includes(namespaceAndName);
    }

    getNamespace(event: any): string {
        return ((event.directive || {}).header || {}).namespace;
    }

    getName(event: any): string {
        return ((event.directive || {}).header || {}).name;
    }

    getBearerToken(event: any): string {
        return (((event.directive || {}).endpoint || {}).scope || {}).token;
    }

    getCorrelationToken(event: any): string {
        return ((event.directive || {}).header || {}).correlationToken;
    }

    getEndpointId(event: any): string {
        return ((event.directive || {}).endpoint || {}).endpointId;
    }

    getCookie(event: any): any {
        return ((event.directive || {}).endpoint || {}).cookie;
    }

    getBidirectionalDirectives(event: any): Array<string> {
        return ((this.getCookie(event) || {}).bidiractionalDirectives || []);
    }

    resolveResponse(response: AlexaResponse): Promise<AlexaResponse> {
        logger.info("----- response -----");
        logger.info(JSON.stringify(response));
        return Promise.resolve(response);
    };
}

