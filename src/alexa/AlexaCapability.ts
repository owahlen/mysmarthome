/**
 * Interface for the Alexa capability object schema:
 * @see https://developer.amazon.com/de-DE/docs/alexa/device-apis/alexa-discovery.html#capability-object
 */
import {AlexaCapabilityType} from "./AlexaCapabilityType";
import {AlexaCapabilityInterface} from "./AlexaCapabilityInterface";

export interface AlexaCapability {
    type: AlexaCapabilityType,
    interface: AlexaCapabilityInterface,
    instance?: string,
    version: string,
    properties: {
        supported?: Array<any>,
        proactivelyReported?: boolean
        retrievable?: boolean
    },
    capabilityResources?: any,
    configuration?: any,
    semantics?: any
}