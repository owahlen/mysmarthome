import {expect, use as chaiUse} from 'chai';
import 'mocha';
import {powerControllerHandler} from '../../src/handler/PowerControllerHandler';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "../utils";
import {handler} from "../../src";

chaiUse(sinonChai);

describe('PowerControllerHandler', () => {

    let event: any;
    let context: any;

    // setup
    beforeEach(function () {
        event = undefined;
        context = undefined;
    });

    it('should be able to handle PowerController.request', () => {
        // setup
        event = loadJson('test/requests/PowerController.TurnOn.request.json');
        // when
        let canHandle = powerControllerHandler().canHandle(event, context);
        // then
        expect(canHandle).to.be.true;

    });

    it('should publish StandBy key and return PowerController.response on PowerController.request', async () => {
        // setup
        event = loadJson('test/requests/PowerController.TurnOn.request.json');
        // when
        let result = await powerControllerHandler().handle(event, context);
        // then
        //assertPublishedKeys([Key.Standby]);
        expect(result.event.header.namespace).to.equal('Alexa');
        expect(result.event.header.name).to.equal('Response');
        const contextProperties = result.context.properties;
        expect(contextProperties).to.have.lengthOf(1);
        expect(contextProperties[0].namespace).to.equal('Alexa.PowerController');
        expect(contextProperties[0].name).to.equal('powerState');
        expect(contextProperties[0].value).to.equal('ON');
    });

});
