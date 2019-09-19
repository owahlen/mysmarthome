import {expect, use as chaiUse} from 'chai';
import 'mocha';
import {discoveryHandler} from '../../src/handler/DiscoveryHandler';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "../utils";

chaiUse(sinonChai);

describe('DiscoveryHandler', () => {

    let event: any;
    let context: any;

    // setup
    beforeEach(function () {
        event = undefined;
        context = undefined;
    });

    it('should be able to handle Discovery.request', () => {
        // setup
        event = loadJson('test/requests/Discovery.request.json');
        // when
        let canHandle = discoveryHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.true;

    });

    it('should return Discovery.response on Discovery.request', async () => {
        // setup
        event = loadJson('test/requests/Discovery.request.json');
        // when
        let result = await discoveryHandler().handle(event, context);
        // then
        expect(result.event.header.namespace).to.equal('Alexa.Discovery');
        expect(result.event.header.name).to.equal('Discover.Response');
    });

});
