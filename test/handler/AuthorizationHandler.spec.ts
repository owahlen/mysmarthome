import {expect, use as chaiUse} from 'chai';
import 'mocha';
import {authorizationHandler} from '../../src/handler/AuthorizationHandler';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "../utils";

chaiUse(sinonChai);

describe('AuthorizationHandler', () => {

    it('should be able to handle Authorization.request', () => {
        // setup
        const event = loadJson('test/events/Authorization.AcceptGrant.request.json');
        // when
        const canHandle = authorizationHandler().canHandle(event, null);
        // then
        expect(canHandle).to.be.true;

    });

    it('should return Authorization.response on Authorization.request', async () => {
        // setup
        const event = loadJson('test/events/Authorization.AcceptGrant.request.json');
        // when
        let result = await authorizationHandler().handle(event, null);
        // then
        expect(result.event.header.namespace).to.equal('Alexa.Authorization');
        expect(result.event.header.name).to.equal('AcceptGrant.Response');
    });

});
