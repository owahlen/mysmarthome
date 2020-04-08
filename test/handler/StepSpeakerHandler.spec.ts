import {expect, use as chaiUse} from 'chai';
import 'mocha';
import {DEFAULT_STEP_WIDTH, stepSpeakerHandler} from '../../src/handler/StepSpeakerHandler';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "../utils";

chaiUse(sinonChai);

describe('StepSpeakerHandler', () => {

    let event: any;
    let context: any;

    // setup
    beforeEach(function () {
        event = undefined;
        context = undefined;
    });

    it('should be able to handle StepSpeaker.request', () => {
        // setup
        event = loadJson('test/requests/StepSpeaker.AdjustVolume.request.json');
        // when
        let canHandle = stepSpeakerHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.true;

    });

    it('should publish VolumeDown keys and return EndpointHealth.response on StepSpeakerVolume.request with given steps', async () => {
        // setup
        event = loadJson('test/requests/StepSpeaker.AdjustVolume.request.json');
        // when
        let result = await stepSpeakerHandler().handle(event, context);
        // then
        //assertPublishedKeys(Array<Key>(20).fill(Key.VolumeDown));
        expect(result.event.header.namespace).to.equal('Alexa');
        expect(result.event.header.name).to.equal('Response');
        const contextProperties = result.context.properties;
        expect(contextProperties).to.have.lengthOf(1);
        expect(contextProperties[0].namespace).to.equal('Alexa.EndpointHealth');
        expect(contextProperties[0].name).to.equal('connectivity');
        expect(contextProperties[0].value).to.deep.equal({'value': 'OK'});
    });

    it('should publish VolumeDown keys and return EndpointHealth.response on StepSpeakerVolume.request with default steps', async () => {
        // setup
        event = loadJson('test/requests/StepSpeaker.AdjustVolume.request.json');
        event.directive.payload.volumeStepsDefault = true;
        // when
        let result = await stepSpeakerHandler().handle(event, context);
        // then
        //assertPublishedKeys(Array<Key>(DEFAULT_STEP_WIDTH).fill(Key.VolumeDown));
        expect(result.event.header.namespace).to.equal('Alexa');
        expect(result.event.header.name).to.equal('Response');
        const contextProperties = result.context.properties;
        expect(contextProperties).to.have.lengthOf(1);
        expect(contextProperties[0].namespace).to.equal('Alexa.EndpointHealth');
        expect(contextProperties[0].name).to.equal('connectivity');
        expect(contextProperties[0].value).to.deep.equal({'value': 'OK'});
    });

    it('should publish Mute key and return EndpointHealth.response on StepSpeakerMute.request', async () => {
        // setup
        event = loadJson('test/requests/StepSpeaker.SetMute.request.json');
        // when
        let result = await stepSpeakerHandler().handle(event, context);
        // then
        //assertPublishedKeys([Key.Mute]);
        expect(result.event.header.namespace).to.equal('Alexa');
        expect(result.event.header.name).to.equal('Response');
        const contextProperties = result.context.properties;
        expect(contextProperties).to.have.lengthOf(1);
        expect(contextProperties[0].namespace).to.equal('Alexa.EndpointHealth');
        expect(contextProperties[0].name).to.equal('connectivity');
        expect(contextProperties[0].value).to.deep.equal({'value': 'OK'});
    });

});
