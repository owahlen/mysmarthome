import {expect} from "chai";
import {
    closeIotRadios,
    closeIotTransceiver,
    closeIotTransmitter,
    getIotTransceiver,
    getIotTransmitter,
    TRANSCEIVER,
    TRANSMITTER,
    volatileRadioMap
} from "../../src/iot/IotRadioFactory";
import {IotTransmitter} from "../../src/iot/IotTransmitter";
import {IotTransceiver} from "../../src/iot/IotTransceiver";

describe('IotRadioFactory', () => {

    const endpoint = 'test.iot.eu-west-1.amazonaws.com';
    const baseTopic = 'testBaseTopic';

    beforeEach(function () {
        process.env['iotEndpoint'] = endpoint;
        process.env['baseTopic'] = baseTopic;
    });

    afterEach(function () {
        delete (process.env['iotEndpoint']);
        delete (process.env['baseTopic']);
    });

    it('should get IotTransmitter', () => {
        // setup
        volatileRadioMap.clear();
        // when
        const iotRadio = getIotTransmitter();
        // then
        expect(iotRadio).to.be.an.instanceOf(IotTransmitter);
        expect(iotRadio.endpoint).to.equal(endpoint);
        expect(iotRadio.baseTopic).to.equal(baseTopic);
    });

    it('should get IotTransceiver', () => {
        // setup
        volatileRadioMap.clear();
        // when
        const iotRadio = getIotTransceiver();
        // then
        expect(iotRadio).to.be.an.instanceOf(IotTransceiver);
        iotRadio.end(true); // important to avoid test hangup
        expect(iotRadio.endpoint).to.equal(endpoint);
        expect(iotRadio.baseTopic).to.equal(baseTopic);
    });

    it('should close all IotRadios', () => {
        // setup
        getIotTransmitter();
        getIotTransceiver();
        expect(volatileRadioMap.size).to.equal(2);
        // when
        closeIotRadios();
        // then
        expect(volatileRadioMap.size).to.equal(0);
    });

    it('should close the IotTransmitter', () => {
        // setup
        getIotTransmitter();
        getIotTransceiver();
        expect(volatileRadioMap.size).to.equal(2);
        // when
        closeIotTransmitter();
        // then
        expect(volatileRadioMap.size).to.equal(1);
        expect(volatileRadioMap.get(TRANSCEIVER)).to.be.instanceOf(IotTransceiver);
    });

    it('should close the IotTransceiver', () => {
        // setup
        getIotTransmitter();
        getIotTransceiver();
        expect(volatileRadioMap.size).to.equal(2);
        // when
        closeIotTransceiver();
        // then
        expect(volatileRadioMap.size).to.equal(1);
        expect(volatileRadioMap.get(TRANSMITTER)).to.be.instanceOf(IotTransmitter);
    });

});
