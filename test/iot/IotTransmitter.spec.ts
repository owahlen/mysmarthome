import {expect} from "chai";
import {IotTransmitter} from "../../src/iot/IotTransmitter";
import * as sinon from "sinon";
import {IotRequest} from "../../src/iot/IotRequest";
import * as IotData from "aws-sdk/clients/iotdata";

describe('IotTransmitter', () => {

    it('should initialize iotData with endpoint', () => {

        // when
        const iotTransmitter = new IotTransmitter('testIotEndpoint', 'testBaseTopic');

        // then
        expect(iotTransmitter.iotData.endpoint.host).to.equalIgnoreCase('testIotEndpoint');
    });

    it('should send iotRequest through iotData', () => {
        // setup
        const iotTransmitter = new IotTransmitter('testIotEndpoint', 'testBaseTopic');
        const publishStub = sinon.stub().callsFake((...args: any[]) => {
            const callback = args[1];
            callback();
        });
        iotTransmitter.iotData = new class MyIotData extends IotData {
            publish = publishStub;
        }({endpoint: 'testIotEndpoint'});
        const iotRequest: IotRequest = {endpointId: 'testEndpointId', payload: 'testPayload'};

        // when
        const sendPromise = iotTransmitter.send(iotRequest);

        // then
        expect(sendPromise).to.be.fulfilled;
        expect(publishStub).to.have.been.calledOnce;
        const paramsArg = publishStub.getCall(0).args[0];
        expect(paramsArg.topic).startsWith('testBaseTopic/request');
        expect(paramsArg.payload).to.equal(JSON.stringify(iotRequest));
    });

});
