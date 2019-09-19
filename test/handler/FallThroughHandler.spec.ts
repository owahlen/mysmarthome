import {expect, use as chaiUse} from 'chai';
import 'mocha';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "../utils";
import {fallThroughHandler} from "../../src/handler/FallThroughHandler";

chaiUse(sinonChai);

describe('FallThroughHandler', () => {

    let event: any;
    let context: any;

    // setup
    beforeEach(function () {
        event = undefined;
        context = undefined;
    });

    it('should be able to handle UnknownNamespace.request', () => {
        // setup
        event = loadJson('test/requests/UnknownNamespace.request.json');
        // when
        let canHandle = fallThroughHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.true;

    });

    it('should return Error.response on UnknownNamespace.request', async () => {
        // setup
        event = loadJson('test/requests/UnknownNamespace.request.json');
        // when
        let result = await fallThroughHandler().handle(event, context);
        // then
        expect(result.event.header.name).to.equal('ErrorResponse');
        expect(result.event.payload.type).to.equal('INTERNAL_ERROR');
    });

});
