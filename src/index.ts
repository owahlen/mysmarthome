import * as AWS from "aws-sdk";
import {handlerBuilder} from "./handler/HandlerBuilder";
import {discoveryHandler} from "./handler/DiscoveryHandler";
import {logger} from "./utils/logger";
import {AlexaResponse} from "./alexa/AlexaResponse";
import {bidirectionalHandler} from "./handler/BidirectionalHandler";
import {unidirectionalHandler} from "./handler/UnidirectionalHandler";

AWS.config.update({region: 'eu-west-1'});

export const handler = async (event: any, context: any): Promise<AlexaResponse> => {

    // Dump the event and context for logging to CloudWatch
    logger.info("----- event -----");
    logger.info(JSON.stringify(event));

    if (context !== undefined) {
        // set callbackWaitsForEmptyEventLoop to false to share connection between Lambda invocations
        context.callbackWaitsForEmptyEventLoop = false;
        logger.info("----- context -----");
        logger.info(JSON.stringify(context));
    }

    return handlerBuilder()
        .add(bidirectionalHandler())
        .add(discoveryHandler())
        .add(unidirectionalHandler())
        .build()
        (event, context);
};
