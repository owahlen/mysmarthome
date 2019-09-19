import {Key} from "../key";
import {logger} from "../logger";
import {RequestResponseProtocol, requestResponseProtocol} from "./RequestResponseProtocol";
import {IotResponse} from "./IotResponse";

const DIGIT_KEYS = {
    '0': Key.Digit0,
    '1': Key.Digit1,
    '2': Key.Digit2,
    '3': Key.Digit3,
    '4': Key.Digit4,
    '5': Key.Digit5,
    '6': Key.Digit6,
    '7': Key.Digit7,
    '8': Key.Digit8,
    '9': Key.Digit9,
};

export const iotEndpoint = 'a1r5gapbm9ij1g-ats.iot.eu-west-1.amazonaws.com';
export const baseTopic = 'mysmarthome';

// The RequestResponseProtocol is lazily initialized:
// Holding the protocol on module level allows subsequent calls of the warm lambda
// function to reuse the protocol's MQTT connection.
// Late initialization is done for testability.
let protocol: RequestResponseProtocol | undefined = undefined;
export const getProtocol = () => {
    if (protocol === undefined) {
        protocol = requestResponseProtocol(iotEndpoint, baseTopic);
    }
    return protocol;
};
export const clearProtocol = () => {
    protocol = undefined;
};

export const getDigitKeys = (channelNumber: string): Array<Key> => {
    let keys = new Array<Key>();
    for (let i = 0; i < channelNumber.length; i++) {
        const key = DIGIT_KEYS[channelNumber.charAt(i)];
        keys.push(key);
    }
    return keys;
};

export const publishKey = async (key: Key): Promise<IotResponse> => {
    return publishKeys([key]);
};

export const publishKeys = async (keys: Array<Key>): Promise<IotResponse> => {
    const keysJson = JSON.stringify(keys);
    logger.info("publishing keys: " + keysJson);
    return getProtocol().get(keysJson);
};


