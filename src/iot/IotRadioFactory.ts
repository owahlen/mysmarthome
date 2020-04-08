import {getenv} from "../utils/environment";
import {IotTransmitter, iotTransmitter} from "./IotTransmitter";
import {IotTransceiver, iotTransceiver} from "./IotTransceiver";
import {IotRadio} from "./IotRadio";

/**
 * IotRadios are stored in the volatileRadioMap on module level.
 * If the map is used within an AWS lambda its radios can be re-used upon subsequent calls.
 * Hereby redundant and time consuming connection creation with AWS iot can be avoided.
 */
export const volatileRadioMap = new Map<string, IotRadio>();
export const TRANSMITTER = "TRANSMITTER";
export const TRANSCEIVER = "TRANSCEIVER";

/**
 * Factory function for the IotTransmitter
 */
export const getIotTransmitter = (): IotTransmitter => {
    return getIotRadio(TRANSMITTER, iotTransmitter) as IotTransmitter;
};

/**
 * Factory function for the IotTransceiver
 */
export const getIotTransceiver = (): IotTransceiver => {
    return getIotRadio(TRANSCEIVER, iotTransceiver) as IotTransceiver;
};

/**
 * Close all IotRadios
 */
export const closeIotRadios = () => {
    volatileRadioMap.clear();
};

/**
 * Close the IotTransmitter
 */
export const closeIotTransmitter = () => {
    volatileRadioMap.delete(TRANSMITTER);
};

/**
 * Close the IotTransceiver
 */
export const closeIotTransceiver = () => {
    volatileRadioMap.delete(TRANSCEIVER);
};

const getIotRadio = (key: string, factoryMethod: (iotEndpoint: string, baseTopic: string) => IotRadio) => {
    const existingIotRadio = volatileRadioMap.get(key);
    if (existingIotRadio) {
        return existingIotRadio;
    } else {
        const newIotRadio = factoryMethod(
            getenv('iotEndpoint'),
            getenv('baseTopic')
        );
        volatileRadioMap.set(key, newIotRadio);
        return newIotRadio
    }
};
