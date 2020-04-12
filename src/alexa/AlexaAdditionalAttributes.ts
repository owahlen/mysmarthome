/**
 * Interface for the Alexa Additional attributes object schema:
 * @see https://developer.amazon.com/de-DE/docs/alexa/device-apis/alexa-discovery.html#additionalattributes-object
 */
export interface AlexaAdditionalAttributes {
    manufacturer? : string,
    model? : string,
    serialNumber?: string,
    firmwareVersion? : string,
    softwareVersion?: string,
    customIdentifier?: string
}
