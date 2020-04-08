import * as sinon from "sinon";
import {consoleTransport} from "../src/utils/logger";
import {IotTransceiver} from "../src/iot/IotTransceiver";
import {closeIotRadios, TRANSCEIVER, TRANSMITTER, volatileRadioMap} from "../src/iot/IotRadioFactory";
import {IotTransmitter} from "../src/iot/IotTransmitter";
import {IotRadio} from "../src/iot/IotRadio";

// Global configuration for all tests

// set the log level of the consoleTransport when running tests
consoleTransport.level = 'warn';

// Let the IotRadioFactory return stubs of all IotRadios
beforeEach(function () {
    closeIotRadios();
    volatileRadioMap.set(TRANSMITTER, sinon.createStubInstance(IotTransmitter) as unknown as IotRadio);
    const iotTransceiverStub = sinon.createStubInstance(IotTransceiver);
    iotTransceiverStub.get.returns(
        Promise.resolve([{
            endpointId: "testEndpointId",
            payload: {status: "OK"}
        }]));
    volatileRadioMap.set(TRANSCEIVER, iotTransceiverStub as unknown as IotRadio);
});

afterEach(function () {
    closeIotRadios();
});
