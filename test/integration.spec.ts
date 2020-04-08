import {expect, use as chaiUse} from 'chai';
import 'mocha';
import * as sinonChai from 'sinon-chai'
import {loadJson} from "./utils";
import * as chaiString from "chai-string";
import {handler} from '../src';

chaiUse(sinonChai);
chaiUse(chaiString);

describe('integration', () => {

    it('should publish StandBy key on PowerController.request', async () => {
        // setup
        const event = loadJson('test/requests/PowerController.TurnOn.request.json');
        const context = undefined;

        // when
        const result = await handler(event, context);

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
