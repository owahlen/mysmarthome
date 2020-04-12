import {expect, use as chaiUse} from 'chai';
import 'mocha';
import {discoveryHandler} from '../../src/handler/DiscoveryHandler';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "../utils";
import {getIotTransceiver} from "../../src/iot/IotRadioFactory";
import {SinonStubbedInstance} from "sinon";
import {IotTransceiver} from "../../src/iot/IotTransceiver";
import {AlexaEndpoint} from "../../src/alexa/AlexaEndpoint";

chaiUse(sinonChai);

describe('DiscoveryHandler', () => {

    it('should be able to handle Discovery.request', () => {
        // setup
        const event = loadJson('test/events/Discovery.request.json');
        // when
        let canHandle = discoveryHandler().canHandle(event, undefined);
        // then
        expect(canHandle).to.be.true;

    });

    it('should return Discovery.response on Discovery.request', async () => {
        // setup
        const event = loadJson('test/events/Discovery.request.json');
        const iotTransceiverStub = getIotTransceiver() as unknown as SinonStubbedInstance<IotTransceiver>;
        iotTransceiverStub.get.returns(
            Promise.resolve([{
                endpointId: "testEndpointId",
                payload: alexaEndpoint
            }]));

        // when
        let result = await discoveryHandler().handle(event, undefined);
        // then
        expect(result.event.header.namespace).to.equal('Alexa.Discovery');
        expect(result.event.header.name).to.equal('Discover.Response');
        expect(result.event.payload.endpoints).to.have.lengthOf(1);
    });


    const alexaEndpoint: AlexaEndpoint = {
        endpointId: 'raspberrypi001',
        manufacturerName: 'Gutmann',
        description: 'Extractor Hood',
        friendlyName: 'Extractor Hood',
        displayCategories: ['FAN'],
        capabilities: [{
            type: "AlexaInterface",
            interface: "Alexa.PowerController",
            version: "3",
            properties: {
                supported: [{
                    name: "powerState"
                }],
                proactivelyReported: true,
                retrievable: true
            }
        }]
    }

});
