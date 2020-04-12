import {expect, use as chaiUse} from 'chai';
import * as sinon from 'sinon';
import 'mocha';
import * as sinonChai from 'sinon-chai'
import {handlerBuilder} from "../../src/handler/HandlerBuilder";
import {AlexaResponse} from "../../src/alexa/AlexaResponse";
import {Handler} from "../../src/handler/Handler";
import {consoleTransport} from "../../src/utils/logger";

chaiUse(sinonChai);

describe('HandlerBuilder', () => {

    const sandbox = sinon.createSandbox();
    let handlers: Array<Handler>;

    beforeEach(function () {
        // avoid expected error in test logs:
        consoleTransport.silent = true;
        handlers = [{
            canHandle: sandbox.stub(),
            handle: sandbox.stub()
        } as unknown as Handler, {
            canHandle: sandbox.stub(),
            handle: sandbox.stub()
        } as unknown as Handler];
    });

    afterEach(function () {
        consoleTransport.silent = false;
        sandbox.restore();
    });

    it('should call canHandle of all added handlers if none answers with true', () => {
        // setup
        handlers.forEach((handler) => {
            handler.canHandle = sinon.fake.returns(false);
        });
        const event = {};
        const context = {};
        const builder = handlerBuilder();

        // when
        handlers.forEach((handler) => builder.add(handler));
        const handler = builder.build();
        const handlerPromise = handler(event, context);

        // then
        expect(handlers[0].canHandle).to.have.been.calledOnce;
        expect(handlers[0].handle).to.have.not.been.called;
        expect(handlers[1].canHandle).to.have.been.calledOnce;
        expect(handlers[1].handle).to.have.not.been.called;
        return expect(handlerPromise).to.be.rejectedWith("unable to handle event");
    });

    it('should call handle only on first handler if canHandle is true for all handlers', async () => {
        // setup
        const alexaResponse = sinon.createStubInstance(AlexaResponse);
        handlers.forEach((handler) => {
            handler.canHandle = sinon.fake.returns(true);
            handler.handle = sinon.fake.returns(Promise.resolve<AlexaResponse>(alexaResponse));
        });
        const event = {};
        const context = {};
        const builder = handlerBuilder();

        // when
        handlers.forEach((handler) => builder.add(handler));
        const handler = builder.build();
        const response = await handler(event, context);

        // then
        expect(handlers[0].canHandle).to.have.been.calledOnce;
        expect(handlers[0].handle).to.have.been.calledOnce;
        expect(handlers[1].canHandle).to.have.not.been.called;
        expect(handlers[1].handle).to.have.not.been.called;
        expect(response).to.equal(alexaResponse);
    });

    it('should call handle only on second handler if the first responded with false on canHandle', async () => {
        // setup
        const alexaResponse = sinon.createStubInstance(AlexaResponse);
        handlers[0].canHandle = sinon.fake.returns(false);
        handlers[1].canHandle = sinon.fake.returns(true);
        handlers.forEach((handler) => {
            handler.handle = sinon.fake.returns(Promise.resolve<AlexaResponse>(alexaResponse));
        });
        const event = {};
        const context = {};
        const builder = handlerBuilder();

        // when
        handlers.forEach((handler) => builder.add(handler));
        const handler = builder.build();
        const response = await handler(event, context);

        // then
        expect(handlers[0].canHandle).to.have.been.calledOnce;
        expect(handlers[0].handle).to.have.not.been.called;
        expect(handlers[1].canHandle).to.have.been.calledOnce;
        expect(handlers[1].handle).to.have.been.calledOnce;
        expect(response).to.equal(alexaResponse);
    });

});
