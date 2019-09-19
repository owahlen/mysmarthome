import {expect, use as chaiUse} from 'chai';
import 'mocha';
import {authorizationHandler} from '../../src/handler/AuthorizationHandler';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "../utils";

chaiUse(sinonChai);

describe('AuthorizationHandler', () => {

    let event: any;
    let context: any;

    // setup
    beforeEach(function () {
        event = loadJson('test/requests/Authorization.AcceptGrant.request.json');
        context = undefined;
    });

    it('should be able to handle Authorization.request', () => {
        // when
        let canHandle = authorizationHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.true;

    });

    it('should return Authorization.response on Authorization.request', async () => {
        // when
        let result = await authorizationHandler().handle(event, context);
        // then
        expect(result.event.header.namespace).to.equal('Alexa.Authorization');
        expect(result.event.header.name).to.equal('AcceptGrant.Response');
    });

});
