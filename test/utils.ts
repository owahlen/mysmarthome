import * as sinon from "sinon";
import * as fs from "fs";
import {Key} from "../src/key";
import {expect} from "chai";
import {getProtocol} from "../src/iot/iot";

export const loadJson = (path: string): any => {
    const jsonString = fs.readFileSync(path, 'utf8');
    return JSON.parse(jsonString);
};

export const assertPublishedKeys = (expectedKeys: Array<Key>) => {
    const protocol = getProtocol();
    const getter = <sinon.SinonStub> protocol.get;
    expect(getter).to.have.been.calledOnce;
    const capturedMessage = getter.getCall(0).args[0];
    const keyArray = JSON.parse(<string>capturedMessage);
    expect(keyArray).to.eql(expectedKeys);
};
