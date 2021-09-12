import { uuid } from "../utils/idGeneration";
import {AlexaEndpoint} from "./AlexaEndpoint";

/**
 * Helper class to generate an AlexaResponse.
 * @class
 */
export class AlexaResponse {

    event: any;
    context: any;

    /**
     * Constructor for an Alexa Response.
     * @constructor
     * @param opts Contains initialization options for the response
     */
    constructor(opts: any = {}) {
        if (opts.context !== undefined) {
            this.context = defaultIfEmpty(opts.context, undefined);
        }

        if (opts.event !== undefined) {
            this.event = defaultIfEmpty(opts.event, undefined);
        } else
            this.event = {
                "header": {
                    "namespace": defaultIfEmpty(opts.namespace, "Alexa"),
                    "name": defaultIfEmpty(opts.name, "Response"),
                    "messageId": defaultIfEmpty(opts.messageId, uuid()),
                    "correlationToken": defaultIfEmpty(opts.correlationToken, undefined),
                    "payloadVersion": defaultIfEmpty(opts.payloadVersion, "3")
                },
                "endpoint": {
                    "scope": {
                        "type": "BearerToken",
                        "token": defaultIfEmpty(opts.token, "INVALID"),
                    },
                    "endpointId": defaultIfEmpty(opts.endpointId, "INVALID")
                },
                "payload": defaultIfEmpty(opts.payload, {})
            };

        // No endpoint in an AcceptGrant or Discover request
        if (this.event.header.name === "AcceptGrant.Response" || this.event.header.name === "Discover.Response") {
            delete this.event.endpoint;
        }
    }

    /**
     * Add an endpoint to the payload.
     * @see https://developer.amazon.com/de-DE/docs/alexa/device-apis/alexa-discovery.html#endpoint-object
     * @param alexaEndpoint contains the endpoint object.
     */
    addPayloadEndpoint(alexaEndpoint: AlexaEndpoint) {
        if (this.event.payload.endpoints === undefined) {
            this.event.payload.endpoints = [];
        }
        this.event.payload.endpoints.push(alexaEndpoint);
    }

    /**
     * Add a property to the context.
     * @param opts Contains options for the property.
     */
    addContextProperty(opts: any) {
        if (this.context === undefined) {
            this.context = {properties: []};
        }
        this.context.properties.push(this.createContextProperty(opts));
    }

    /**
     * Creates a property for the context.
     * @param opts Contains options for the property.
     */
    createContextProperty(opts: any) {
        return {
            'namespace': defaultIfEmpty(opts.namespace, "Alexa.EndpointHealth"),
            'name': defaultIfEmpty(opts.name, "connectivity"),
            'value': defaultIfEmpty(opts.value, {"value": "OK"}),
            'timeOfSample': new Date().toISOString(),
            'uncertaintyInMilliseconds': defaultIfEmpty(opts.uncertaintyInMilliseconds, 0)
        };
    }

}

/**
 * Check a value for validity or return a default.
 * @param value The value being checked
 * @param defaultValue A default value if the passed value is not valid
 * @returns {*} The passed value if valid otherwise the default value.
 */
const defaultIfEmpty = (value: any, defaultValue: any) => {
    if (value === undefined || value === {} || value === "") {
        return defaultValue;
    }
    return value;
};
