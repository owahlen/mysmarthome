/**
 * Interface for the Alexa capability object schema:
 * @see https://developer.amazon.com/de-DE/docs/alexa/device-apis/alexa-discovery.html#capability-object
*/
export interface AlexaCapability {
    type: string,
    interface: string,
    instance?: string,
    version: string,
    properties: {
        supported?: Array<Object>,
        proactivelyReported?: boolean
        retrievable?: boolean
    },
    capabilityResources?: Object,
    configuration?: Object,
    semantics?: Object
}