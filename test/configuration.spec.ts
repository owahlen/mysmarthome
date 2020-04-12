import * as sinon from "sinon";
import {consoleTransport} from "../src/utils/logger";
import {IotTransceiver} from "../src/iot/IotTransceiver";
import {closeIotRadios, TRANSCEIVER, TRANSMITTER, volatileRadioMap} from "../src/iot/IotRadioFactory";
import {IotTransmitter} from "../src/iot/IotTransmitter";
import {IotRadio} from "../src/iot/IotRadio";
import {IotResponse} from "../src/iot/IotResponse";

// Global configuration for all tests

// set the log level of the consoleTransport when running tests
consoleTransport.level = 'warn';

// Let the IotRadioFactory return stubs of all IotRadios
beforeEach(function () {
    closeIotRadios();
    stubIotTransmitter();
    stubIotTransceiver();
});

afterEach(function () {
    closeIotRadios();
});

const stubIotTransmitter = () => {
    volatileRadioMap.set(TRANSMITTER, sinon.createStubInstance(IotTransmitter) as unknown as IotRadio);
}

const stubIotTransceiver = () => {
    const iotResponseStub: IotResponse = {
        endpointId: "testEndpointId",
        payload: {}
    }
    const iotTransceiverStub = sinon.createStubInstance(IotTransceiver);
    iotTransceiverStub.get.returns(Promise.resolve([iotResponseStub]));
    volatileRadioMap.set(TRANSCEIVER, iotTransceiverStub as unknown as IotRadio);
}
