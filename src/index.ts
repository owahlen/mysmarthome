import * as AWS from "aws-sdk";
import {handlerBuilder} from "./handler/HandlerBuilder";
import {validationHandler} from "./handler/ValidationHandler";
import {authorizationHandler} from "./handler/AuthorizationHandler";
import {discoveryHandler} from "./handler/DiscoveryHandler";
import {powerControllerHandler} from "./handler/PowerControllerHandler";
import {fallThroughHandler} from "./handler/FallThroughHandler";
import {logger} from "./logger";
import {stepSpeakerHandler} from "./handler/StepSpeakerHandler";
import {channelControllerHandler} from "./handler/ChannelControllerHandler";

AWS.config.update({region: 'eu-west-1'});

export const handler = async (event: any, context: any) => {

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
        .add(validationHandler())
        .add(authorizationHandler())
        .add(discoveryHandler())
        .add(channelControllerHandler())
        .add(powerControllerHandler())
        .add(stepSpeakerHandler())
        .add(fallThroughHandler())
        .build()
        (event, context);
};
