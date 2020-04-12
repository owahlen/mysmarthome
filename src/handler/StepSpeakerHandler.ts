import {getNamespace, Handler, resolveResponse} from "./Handler";
import {AlexaResponse} from "../alexa/AlexaResponse";

export const DEFAULT_STEP_WIDTH = 5;

class StepSpeakerHandler implements Handler {

    canHandle(event: any, context: any): boolean {
        return getNamespace(event) === 'Alexa.StepSpeaker';
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

        if (event.directive.header.name === "AdjustVolume") {
            const volumeSteps = ((steps: number, stepsDefault: boolean): number => {
                if (stepsDefault) {
                    return steps < 0 ? -DEFAULT_STEP_WIDTH : DEFAULT_STEP_WIDTH;
                } else {
                    return steps;
                }
            })(
                event.directive.payload.volumeSteps,
                event.directive.payload.volumeStepsDefault
            );
            //const keys = new Array<Key>(Math.abs(volumeSteps));
            //if (volumeSteps < 0) keys.fill(Key.VolumeDown);
            //else keys.fill(Key.VolumeUp);
            //await publishKeys(keys);
        } else if (event.directive.header.name === "SetMute") {
            const mute = event.directive.payload.mute;
            //await publishKey(Key.Mute);
        }
        alexaResponse.addContextProperty({});

        return resolveResponse(alexaResponse);
    }
}

export const stepSpeakerHandler = () => new StepSpeakerHandler();
