"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voting = void 0;
class VotingPubSub {
    channels = {};
    subscriber(pollId, subscriber) {
        if (!this.channels[pollId]) {
            this.channels[pollId] = [];
        }
        this.channels[pollId].push(subscriber);
    }
    publish(pollId, message) {
        if (!this.channels[pollId]) {
            return;
        }
        for (const subscriber of this.channels[pollId]) {
            subscriber(message);
        }
    }
}
exports.voting = new VotingPubSub;
