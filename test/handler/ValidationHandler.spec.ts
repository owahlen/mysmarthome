import {expect, use as chaiUse} from 'chai';
import 'mocha';
import {validationHandler} from '../../src/handler/ValidationHandler';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "../utils";

chaiUse(sinonChai);

describe('ValidationHandler', () => {

    let event: any;
    let context: any;

    // setup
    beforeEach(function () {
        event = loadJson('test/requests/PowerController.TurnOn.request.json');
        context = undefined;
    });

    it('should reject to handle valid directive', () => {
        // when
        let canHandle = validationHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.false;
    });

    it('should handle requests that are not directives', () => {
        // setup
        delete event.directive;
        // when
        let canHandle = validationHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.true;
    });

    it('should handle requests that do not have payload version 3', () => {
        // setup
        event.directive.header.payloadVersion = '1';
        // when
        let canHandle = validationHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.true;
    });

    it('should return INVALID_DIRECTIVE for requests that are not directives', async () => {
        // setup
        delete event.directive;
        // when
        let result = await validationHandler().handle(event, context);
        // then
        expect(result.event.header.name).to.equal('ErrorResponse');
        expect(result.event.payload.type).to.equal('INVALID_DIRECTIVE');
    });

    it('should return INTERNAL_ERROR for requests that do not have payload version 3', async () => {
        // setup
        event.directive.header.payloadVersion = '1';
        // when
        let result = await validationHandler().handle(event, context);
        // then
        expect(result.event.header.name).to.equal('ErrorResponse');
        expect(result.event.payload.type).to.equal('INTERNAL_ERROR');
    });

});
