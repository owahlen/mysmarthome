/**
 * Interface for the Alexa connection object schema:
 * @see https://developer.amazon.com/de-DE/docs/alexa/device-apis/alexa-discovery.html#connections-object
 */
export interface AlexaConnection {
    type: string,
    macAddress?: string,
    homeId?: string,
    nodeId?: string,
    value?: string
}