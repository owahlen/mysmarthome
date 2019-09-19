import * as sinon from "sinon";

export class deviceFake {
    subscribedTopic: string | undefined;
    messageListener: ((topic: string, payload: any) => void) | undefined;

    constructor(options: any) {
        this.subscribedTopic = undefined;
        this.messageListener = undefined;
    }

    on = sinon.spy((event: string, listener: (topic: string, payload: any) => void): this => {
        switch (event) {
            case "connect":
                // fake an immediate connection
                setTimeout(listener, 0);
                break;
            case "message":
                // record calls of incoming messages in a spy
                this.messageListener = sinon.spy(listener);
                break;
            case "error":
                break;
            default:
                throw Error("unable to register handler for unknown event type");
        }
        return this;
    });

    publish = sinon.spy((topic: string, message: Buffer | string, options?: any, callback?: (error?: Error) => void) => {
        setTimeout(() => {
            if (typeof callback === 'function') {
                callback();
            }
            if (this.topicMatchesFilter(topic, this.subscribedTopic) && typeof this.messageListener === 'function') {
                this.messageListener(topic, message);
            }
        }, 0);
    });

    subscribe = sinon.spy((topic: string, options?: any, callback?: (error?: Error) => void) => {
        this.subscribedTopic = topic;
        if (typeof callback === 'function') {
            setTimeout(callback, 0);
        }
    });

    unsubscribe = sinon.spy((topic: string, options?: any, callback?: (error?: Error) => void) => {
        this.subscribedTopic = undefined;
        if (typeof callback === 'function') {
            setTimeout(callback, 0);
        }
    });

    end = sinon.spy(() => {
    });

    private topicMatchesFilter(topic: string, filter: string | undefined): boolean {
        if (filter === undefined) {
            return false;
        }
        const topicParts = topic.split('/');
        const filterParts = filter.split('/');
        if (filterParts.length > topicParts.length) {
            return false;
        }
        const mismatch = filterParts.find((filterPart, index) => {
            if (filterPart === '#') {
                return false;
            } else {
                return filterPart !== '+' && filterPart !== topicParts[index];
            }
        });
        return mismatch === undefined;
    }
}
