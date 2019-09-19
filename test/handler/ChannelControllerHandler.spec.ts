import {expect, use as chaiUse} from 'chai';
import 'mocha';
import {channelControllerHandler} from '../../src/handler/ChannelControllerHandler';
import * as sinonChai from 'sinon-chai'
import {assertPublishedKeys, loadJson} from "../utils";
import {Key} from "../../src/key";

chaiUse(sinonChai);

describe('ChannelControllerHandler', () => {

    let event: any;
    let context: any;

    // setup
    beforeEach(function () {
        event = undefined;
        context = undefined;
    });

    it('should be able to handle ChannelControllerHandler.request', () => {
        // setup
        event = loadJson('test/requests/ChannelController.ChangeChannel.request.json');
        // when
        let canHandle = channelControllerHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.true;

    });

    it('should publish number keys and return EndpointHealth.response on ChannelController.ChangeChannel.request', async () => {
        // setup
        event = loadJson('test/requests/ChannelController.ChangeChannel.request.json');
        // when
        let result = await channelControllerHandler().handle(event, context);
        // then
        assertPublishedKeys([Key.Digit1, Key.Digit2, Key.Digit3, Key.Digit4]);
        expect(result.event.header.namespace).to.equal('Alexa');
        expect(result.event.header.name).to.equal('Response');
        const contextProperties = result.context.properties;
        expect(contextProperties).to.have.lengthOf(2);
        expect(contextProperties[0].namespace).to.equal('Alexa.ChannelController');
        expect(contextProperties[0].name).to.equal('channel');
        expect(contextProperties[0].value.number).to.equal('1234');
        expect(contextProperties[1].namespace).to.equal('Alexa.EndpointHealth');
        expect(contextProperties[1].name).to.equal('connectivity');
        expect(contextProperties[1].value).to.deep.equal({'value': 'OK'});
    });

    it('should publish ChannelUp keys and return EndpointHealth.response on ChannelController.SkipChannels.request', async () => {
        // setup
        event = loadJson('test/requests/ChannelController.SkipChannels.request.json');
        // when
        let result = await channelControllerHandler().handle(event, context);
        // then
        assertPublishedKeys(Array<Key>(5).fill(Key.ChannelStepUp));
        expect(result.event.header.namespace).to.equal('Alexa');
        expect(result.event.header.name).to.equal('Response');
        const contextProperties = result.context.properties;
        expect(contextProperties).to.have.lengthOf(1);
        expect(contextProperties[0].namespace).to.equal('Alexa.EndpointHealth');
        expect(contextProperties[0].name).to.equal('connectivity');
        expect(contextProperties[0].value).to.deep.equal({'value': 'OK'});
    });

});
