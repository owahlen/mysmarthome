import {expect, use as chaiUse} from 'chai';
import 'mocha';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "../utils";
import {bidirectionalHandler} from "../../src/handler/BidirectionalHandler";
import {getIotTransceiver} from "../../src/iot/IotRadioFactory";
import {SinonStubbedInstance} from "sinon";
import {IotTransceiver} from "../../src/iot/IotTransceiver";

chaiUse(sinonChai);

describe('BidirectionalHandler', () => {

    it('should not handle unidirectionalDirectives', () => {
        // setup
        const event = loadJson('test/events/PowerController.TurnOn.request.json');
        // when
        let canHandle = bidirectionalHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.false;
    });

    it('should handle bidirectionalDirectives', () => {
        // setup
        const event = loadJson('test/events/PowerController.TurnOn.request.json');
        event.directive.endpoint.cookie.bidiractionalDirectives = ['Alexa.PowerController']
        // when
        let canHandle = bidirectionalHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.true;
    });

    it('should publish response from iot', async () => {
        // setup
        const event = loadJson('test/events/PowerController.TurnOn.request.json');
        const iotResponse = {
            endpointId: event.directive.endpoint.endpointId,
            payload: loadJson('test/events/PowerController.TurnOn.response.json')
        }
        const iotTransceiverStub = getIotTransceiver() as unknown as SinonStubbedInstance<IotTransceiver>;
        iotTransceiverStub.get.returns(Promise.resolve([iotResponse]));
        // when
        let alexaResponse = await bidirectionalHandler().handle(event, context);
        // then
        expect(alexaResponse.event).to.deep.equal(iotResponse.payload.event);
        expect(alexaResponse.context).to.deep.equal(iotResponse.payload.context);
    });

});
