/**
 * Interface for the Alexa endpoint object schema:
 * @see https://developer.amazon.com/de-DE/docs/alexa/device-apis/alexa-discovery.html#endpoint-object
 */
import {AlexaAdditionalAttributes} from "./AlexaAdditionalAttributes";
import {AlexaCapability} from "./AlexaCapability";
import {AlexaConnection} from "./AlexaConnection";
import {AlexaRelationships} from "./AlexaRelationships";
import {AlexaDisplayCategory} from "./AlexaDisplayCategory";

export interface AlexaEndpoint {
    endpointId: string,
    manufacturerName: string,
    description: string,
    friendlyName: string,
    displayCategories: Array<AlexaDisplayCategory>,
    additionalAttributes?: AlexaAdditionalAttributes,
    capabilities: Array<AlexaCapability>,
    connections?: Array<AlexaConnection>,
    relationships?: AlexaRelationships,
    cookie?: any
}
