import * as uuid from "uuid";

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
            this.context = checkValue(opts.context, undefined);
        }

        if (opts.event !== undefined) {
            this.event = checkValue(opts.event, undefined);
        } else
            this.event = {
                "header": {
                    "namespace": checkValue(opts.namespace, "Alexa"),
                    "name": checkValue(opts.name, "Response"),
                    "messageId": checkValue(opts.messageId, uuid()),
                    "correlationToken": checkValue(opts.correlationToken, undefined),
                    "payloadVersion": checkValue(opts.payloadVersion, "3")
                },
                "endpoint": {
                    "scope": {
                        "type": "BearerToken",
                        "token": checkValue(opts.token, "INVALID"),
                    },
                    "endpointId": checkValue(opts.endpointId, "INVALID")
                },
                "payload": checkValue(opts.payload, {})
            };

        // No endpoint in an AcceptGrant or Discover request
        if (this.event.header.name === "AcceptGrant.Response" || this.event.header.name === "Discover.Response") {
            delete this.event.endpoint;
        }
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
     * Add an endpoint to the payload.
     * @param opts Contains options for the endpoint.
     */
    addPayloadEndpoint(opts: any) {
        if (this.event.payload.endpoints === undefined) {
            this.event.payload.endpoints = [];
        }
        this.event.payload.endpoints.push(this.createPayloadEndpoint(opts));
    }

    /**
     * Creates a property for the context.
     * @param opts Contains options for the property.
     */
    createContextProperty(opts: any) {
        return {
            'namespace': checkValue(opts.namespace, "Alexa.EndpointHealth"),
            'name': checkValue(opts.name, "connectivity"),
            'value': checkValue(opts.value, {"value": "OK"}),
            'timeOfSample': new Date().toISOString(),
            'uncertaintyInMilliseconds': checkValue(opts.uncertaintyInMilliseconds, 0)
        };
    }

    /**
     * Creates an endpoint for the payload.
     * @param opts Contains options for the endpoint.
     */
    createPayloadEndpoint(opts: any = {}) {
        // Return the proper structure expected for the endpoint
        const endpoint = {
            "capabilities": checkValue(opts.capabilities, []),
            "description": checkValue(opts.description, "Sample Endpoint Description"),
            "displayCategories": checkValue(opts.displayCategories, ["OTHER"]),
            "endpointId": checkValue(opts.endpointId, 'endpoint-001'),
            // "endpointId": checkValue(opts.endpointId, 'endpoint_' + (Math.floor(Math.random() * 90000) + 10000)),
            "friendlyName": checkValue(opts.friendlyName, "Sample Endpoint"),
            "manufacturerName": checkValue(opts.manufacturerName, "Sample Manufacturer")
        };
        if (opts.hasOwnProperty("cookie")) {
            endpoint["cookie"] = checkValue('cookie', {});
        }
        return endpoint
    }

    /**
     * Creates a capability for an endpoint within the payload.
     * @param opts Contains options for the endpoint capability.
     */
    createPayloadEndpointCapability(opts: any = {}) {
        const capability = {};
        capability['type'] = checkValue(opts.type, "AlexaInterface");
        capability['interface'] = checkValue(opts.interface, "Alexa");
        capability['version'] = checkValue(opts.version, "3");
        const supported = checkValue(opts.supported, false);
        if (supported) {
            capability['properties'] = {};
            capability['properties']['supported'] = supported;
            capability['properties']['proactivelyReported'] = checkValue(opts.proactivelyReported, false);
            capability['properties']['retrievable'] = checkValue(opts.retrievable, false);
        }
        return capability
    }

}

/**
 * Check a value for validity or return a default.
 * @param value The value being checked
 * @param defaultValue A default value if the passed value is not valid
 * @returns {*} The passed value if valid otherwise the default value.
 */
const checkValue = (value: any, defaultValue: any) => {
    if (value === undefined || value === {} || value === "") {
        return defaultValue;
    }
    return value;
};
