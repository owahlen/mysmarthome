import {getNamespace, Handler, resolveResponse} from "./Handler";
import {AlexaResponse} from "./AlexaResponse";

class DiscoveryHandler implements Handler {
    canHandle(event: any, context: any): boolean {
        return getNamespace(event) === 'Alexa.Discovery';
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        const alexaResponse = new AlexaResponse({
                "namespace": "Alexa.Discovery",
                "name": "Discover.Response"
            }
        );
        alexaResponse.addPayloadEndpoint({
            "endpointId": "philips-tv-01",
            "friendlyName": "Philips TV",
            "description": "Philips TV",
            "displayCategories": ["TV"],
            "capabilities": [
                alexaResponse.createPayloadEndpointCapability(),
                alexaResponse.createPayloadEndpointCapability({
                    "interface": "Alexa.ChannelController",
                    "supported": [{"name": "channel"}]
                }),
                alexaResponse.createPayloadEndpointCapability({
                    "interface": "Alexa.PowerController",
                    "supported": [{"name": "powerState"}]
                }),
                alexaResponse.createPayloadEndpointCapability({
                    "interface": "Alexa.StepSpeaker",
                    "supported": []
                })
            ]
        });
        return resolveResponse(alexaResponse);
    }
}

export const discoveryHandler = () => new DiscoveryHandler();
