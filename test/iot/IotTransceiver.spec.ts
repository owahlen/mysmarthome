import {expect, use as chaiUse} from "chai";
import * as sinonChai from "sinon-chai";
import {IotTransceiver} from "../../src/iot/IotTransceiver";
import * as uuid from "uuid";
import * as sinon from "sinon";
import {v4} from "uuid";
import * as awsIot from "aws-iot-device-sdk";
import {deviceFake} from "./deviceFake";
import * as chaiAsPromised from "chai-as-promised";
import {consoleTransport} from "../../src/utils/logger";
import {IotRequest} from "../../src/iot/IotRequest";
import {IotResponse} from "../../src/iot/IotResponse";

chaiUse(sinonChai);
chaiUse(chaiAsPromised);

describe('IotTransceiver', () => {

    const iotEndpoint = 'test.iot.eu-west-1.amazonaws.com';
    const baseTopic = 'mysmarthome';
    const requestId = "00000000-0000-0000-0000-000000000000";
    const endpointId = 'testEndpointId';
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

    it('should resolve for single endpointId if response status is OK', async () => {
        // setup
        const iotRequest: IotRequest = {endpointId:endpointId, payload: ["VolumeUp", "VolumeDown"]};
        const iotResponse: IotResponse = {endpointId:endpointId, payload : {"status": "OK"}};
        const iotTransceiver = new IotTransceiver(iotEndpoint, baseTopic);
        // when
        const iotResponsesPromise = iotTransceiver.get(iotRequest);
        device.publish(responseTopic, JSON.stringify(iotResponse));
        const iotResponses = await iotResponsesPromise;
        // then
        expect(iotResponses.length).to.equal(1);
        const iotResponseResult = iotResponses[0];
        expect(iotResponseResult.endpointId).to.equal(endpointId);
        expect(iotResponseResult.payload).to.deep.equal(iotResponse.payload);
        iotTransceiver.end();
    }).timeout(10000);

    it('should reject for single endpointId if response status is not OK', () => {
        // setup
        const RESPONSE_STATUS = "EHOSTUNREACH";
        const iotRequest: IotRequest = {endpointId:endpointId, payload: ["VolumeUp", "VolumeDown"]};
        const iotResponse: IotResponse = {endpointId:endpointId, payload : {"status": RESPONSE_STATUS}};
        const iotTransceiver = new IotTransceiver(iotEndpoint, baseTopic);
        // when
        const iotResponsesPromise = iotTransceiver.get(iotRequest);
        device.publish(responseTopic, JSON.stringify(iotResponse));
        // then
        expect(iotResponsesPromise).to.be.rejectedWith("EHOSTUNREACH");
        iotTransceiver.end();
    }).timeout(10000);

});
