import * as sinon from "sinon";
import {consoleTransport} from "../src/logger";
import * as rrp from "../src/iot/RequestResponseProtocol"
import {clearProtocol} from "../src/iot/iot";

// Global configuration for all tests

// set the log level of the consoleTransport when running tests
consoleTransport.level = 'warn';

const sandbox = sinon.createSandbox();

// stub the iotData.publish function
beforeEach(function () {
    clearProtocol();
    sandbox.stub(rrp, 'requestResponseProtocol').callsFake((iotEndpoint: string, baseTopic: string) => {
        const protocolStub = sinon.createStubInstance(rrp.RequestResponseProtocol);
        protocolStub.get.returns(
            Promise.resolve({
                requestId: "00000000-0000-0000-0000-000000000000",
                payload: {status: "OK"}
            }));
        return protocolStub;
    });
});

// restore the iotData.publish function
afterEach(function () {
    sandbox.restore();
});
