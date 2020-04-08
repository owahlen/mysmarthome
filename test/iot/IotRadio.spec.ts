import {expect} from "chai";
import {IotRadio} from "../../src/iot/IotRadio";

describe('IotRadio', () => {

    it('should store endpoint and baseTopic', () => {
        // setup
        const testEndpoint = 'testEndpoint';
        const testBaseTopic = 'testBaseTopic';
        // when
        const iotRadio = new IotRadio(testEndpoint, testBaseTopic);
        // then
        expect(iotRadio.endpoint).to.equal(testEndpoint);
        expect(iotRadio.baseTopic).to.equal(testBaseTopic);
    });

    it('should create a requestId', () => {
        // setup
        const iotRadio = new class extends IotRadio {
            callCreateRequestId() {
                return this.createRequestId();
            }
        }('', '');
        // when
        const requestId = iotRadio.callCreateRequestId();
        // then
        expect(requestId.length).to.equal(36);

    });

});
