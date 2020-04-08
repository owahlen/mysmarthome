import * as winston from "winston";
import {format} from "winston";

export const consoleTransport = new winston.transports.Console({
    level: 'info'
});

export const logger = winston.createLogger({
    level: 'info',
    format: format.combine(
        // format.colorize(),
        format.simple()
    ),
    transports: [consoleTransport]
});
