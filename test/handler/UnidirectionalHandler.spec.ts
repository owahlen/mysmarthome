import {expect, use as chaiUse} from 'chai';
import 'mocha';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "../utils";
import {getIotTransmitter} from "../../src/iot/IotRadioFactory";
import {SinonStubbedInstance} from "sinon";
import {unidirectionalHandler} from "../../src/handler/UnidirectionalHandler";
import {IotTransmitter} from "../../src/iot/IotTransmitter";

chaiUse(sinonChai);

describe('UnidirectionalHandler', () => {

    it('should handle unidirectionalDirectives', () => {
        // setup
        const event = loadJson('test/events/PowerController.TurnOn.request.json');
        // when
        let canHandle = unidirectionalHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.true;
    });

    it('should not handle bidirectionalDirectives', () => {
        // setup
        const event = loadJson('test/events/PowerController.TurnOn.request.json');
        event.directive.endpoint.cookie.bidiractionalDirectives = ['Alexa.PowerController']
        // when
        let canHandle = unidirectionalHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.false;
    });

    it('should send event to iot and publish response', async () => {
        // setup
        const event = loadJson('test/events/PowerController.TurnOn.request.json');
        const iotTransmitterStub = getIotTransmitter() as unknown as SinonStubbedInstance<IotTransmitter>;
        // when
        let alexaResponse = await unidirectionalHandler().handle(event, context);
        // then
        // expect transmitter has been called:
        expect(iotTransmitterStub.send).to.have.callCount(1)
        const sentIotRequest = iotTransmitterStub.send.getCall(0).args[0]
        expect(sentIotRequest).to.deep.equal({
            endpointId:event.directive.endpoint.endpointId,
            payload: event
        })
        // expect proper AlexaResponse
        expect(alexaResponse.event.header.name).to.equal('Response');
        expect(alexaResponse.event.header.correlationToken).to.equal(event.directive.header.correlationToken);
        expect(alexaResponse.event.endpoint.scope.token).to.equal(event.directive.endpoint.scope.token);
        expect(alexaResponse.event.endpoint.endpointId).to.equal(event.directive.endpoint.endpointId);
    });

});
