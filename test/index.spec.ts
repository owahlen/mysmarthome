import {expect, use as chaiUse} from 'chai';
import * as sinon from 'sinon';
import 'mocha';
import * as sinonChai from 'sinon-chai'
import * as chaiString from "chai-string";
import {Handler} from "../src/handler/Handler";
import {handler} from '../src';
import * as hb from "../src/handler/HandlerBuilder";
import {handlerBuilder} from "../src/handler/HandlerBuilder";
import {AlexaResponse} from "../src/alexa/AlexaResponse";

chaiUse(sinonChai);
chaiUse(chaiString);

describe('index', () => {

    const handlerModuleNames: Array<string> = [
        'BidirectionalHandler',
        'DiscoveryHandler',
        'UnidirectionalHandler'
    ];

    // import Handlers
    const handlerModules = handlerModuleNames.map(handlerModuleName => require('../src/handler/' + handlerModuleName));
    const handlerNames = handlerModuleNames.map(handlerModuleName => handlerModuleName.charAt(0).toLowerCase() + handlerModuleName.slice(1));
    let handlerFakes: Array<Handler>;

    let handlerBuilderStubInstance: sinon.SinonStubbedInstance<hb.HandlerBuilder>;
    const sandbox = sinon.createSandbox();
    let builtHandlerStub: sinon.SinonStub;

    let alexaResponseStubInstance: sinon.SinonStubbedInstance<AlexaResponse>;

    // stub the HandlerBuilder
    beforeEach(function () {
        // stub the alexaResponse instance
        alexaResponseStubInstance = sandbox.createStubInstance(AlexaResponse);

        // stub the handlerBuilder
        builtHandlerStub = sandbox.stub().callsFake(
            () => Promise.resolve<AlexaResponse>(alexaResponseStubInstance)
        );
        handlerBuilderStubInstance = sandbox.createStubInstance(hb.HandlerBuilder);
        handlerBuilderStubInstance.add.returnsThis();
        handlerBuilderStubInstance.build.returns(builtHandlerStub);
        sandbox.stub(hb, "handlerBuilder").callsFake(() => <hb.HandlerBuilder><unknown>handlerBuilderStubInstance);

        // stub the Handler factory functions to create fake Handlers
        handlerFakes = handlerModules.map((module, index) => {
            const handlerFake: Handler = {
                canHandle: sinon.fake(),
                handle: sinon.fake()
            } as unknown as Handler;
            sandbox.stub(module, handlerNames[index]).callsFake(() => handlerFake);
            return handlerFake;
        });

    });

    // restore the Handler factory methods
    afterEach(function () {
        sandbox.restore();
    });

    it('should add all Handlers to HandlerBuilder', async () => {
        // when
        await handler({}, {});
        // then
        expect(handlerBuilderStubInstance.add).to.have.been.callCount(handlerNames.length);
        handlerFakes.forEach((handlerFake, index) => {
            expect(handlerBuilderStubInstance.add.getCall(index).args[0]).to.equal(handlerFake);
        });

    });

    it('should call built handler with event and context and return its response', async () => {
        // setup
        const event = {};
        const context = {};
        // when
        const result = await handler(event, context);
        // then
        expect(builtHandlerStub.getCall(0).args[0]).to.equal(event);
        expect(builtHandlerStub.getCall(0).args[1]).to.equal(context);
        expect(result).to.equal(alexaResponseStubInstance);
    });
});
