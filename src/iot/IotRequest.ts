export interface IotRequest {
    // if endpointId is undefined the IotRequest is accepted by all endpoints
    endpointId?: string;
    payload: any;
}
