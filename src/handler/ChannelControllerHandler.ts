import {getNamespace, Handler, resolveResponse} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";

class ChannelControllerHandler implements Handler {
    canHandle(event: any, context: any): boolean {
        return getNamespace(event) === 'Alexa.ChannelController';
    }

    async handle(event: any, context: any): Promise<AlexaResponse> {
        const endpointId = event.directive.endpoint.endpointId;
        const token = event.directive.endpoint.scope.token;
        const correlationToken = event.directive.header.correlationToken;

        const alexaResponse = new AlexaResponse(
            {
                "correlationToken": correlationToken,
                "token": token,
                "endpointId": endpointId
            }
        );

        if (event.directive.header.name === "ChangeChannel" && 'number' in event.directive.payload.channel) {
            const newChannelNumber = event.directive.payload.channel.number;
            alexaResponse.addContextProperty({
                "namespace": "Alexa.ChannelController",
                "name": "channel",
                "value": {"number": newChannelNumber}
            });
            //const keys = getDigitKeys(newChannelNumber);
            //await publishKeys(keys);
        } else if (event.directive.header.name === "SkipChannels") {
            const skipChannelCount = event.directive.payload.channelCount;
            //const keys = new Array<Key>(Math.abs(skipChannelCount));
            //if (skipChannelCount < 0) keys.fill(Key.ChannelStepDown);
            //else keys.fill(Key.ChannelStepUp);
            //await publishKeys(keys);
        }
        alexaResponse.addContextProperty({});

        return resolveResponse(alexaResponse);
    }
}

export const channelControllerHandler = () => new ChannelControllerHandler();
