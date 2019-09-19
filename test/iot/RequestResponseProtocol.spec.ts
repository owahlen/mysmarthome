import {expect, use as chaiUse} from "chai";
import * as sinonChai from "sinon-chai";
import {RequestResponseProtocol} from "../../src/iot/RequestResponseProtocol";
import * as uuid from "uuid";
import * as sinon from "sinon";
import {v4} from "uuid";
import {baseTopic, iotEndpoint} from "../../src/iot/iot";
import * as awsIot from "aws-iot-device-sdk";
import {deviceFake} from "./deviceFake";
import * as chaiAsPromised from "chai-as-promised";
import {consoleTransport} from "../../src/logger";

chaiUse(sinonChai);
chaiUse(chaiAsPromised);

describe('RequestResponseProtocol', () => {

    const requestId = "00000000-0000-0000-0000-000000000000";
    const responseTopic = baseTopic + '/response/' + requestId;
    let device: deviceFake;
    let previousLogLevel: string | undefined;

    const sandbox = sinon.createSandbox();

    beforeEach(function () {
        previousLogLevel = consoleTransport.level;
        consoleTransport.level = 'error';
        sandbox.stub(awsIot, 'device').callsFake((options: any) => {
            device = new deviceFake(options);
            return device;
        });
        sandbox.stub(uuid, 'v4').callsFake(() => {
            return requestId;
        });
    });

    afterEach(function () {
        consoleTransport.level = previousLogLevel;
        sandbox.restore();
    });

    it('should resolve if response status is OK', async () => {
        // setup
        const requestPayload = ["VolumeUp", "VolumeDown"];
        const responsePayload = {"status": "OK"};
        // not using factory method here since it is stubbed for all tests
        const protocol = new RequestResponseProtocol(iotEndpoint, baseTopic);
        // when
        const iotResultPromise = protocol.get(requestPayload);
        device.publish(responseTopic, JSON.stringify(responsePayload));
        const iotResult = await iotResultPromise;
        // then
        expect(iotResult.requestId).to.equal(requestId);
        expect(iotResult.payload).to.deep.equal(responsePayload);
        protocol.end();
    }).timeout(10000);

    it('should reject if response status is not OK', () => {
        // setup
        const RESPONSE_STATUS = "EHOSTUNREACH";
        const requestPayload = ["VolumeUp", "VolumeDown"];
        const responsePayload = {"status": RESPONSE_STATUS};
        // not using factory method here since it is stubbed for all tests
        const protocol = new RequestResponseProtocol(iotEndpoint, baseTopic);
        // when
        const iotResultPromise = protocol.get(requestPayload);
        device.publish(responseTopic, JSON.stringify(responsePayload));
        // then
        expect(iotResultPromise).to.be.rejectedWith("EHOSTUNREACH");
        protocol.end();
    }).timeout(10000);

});
