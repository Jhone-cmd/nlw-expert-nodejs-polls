"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pollResults = void 0;
const zod_1 = __importDefault(require("zod"));
const voting_pub_sub_1 = require("../utils/voting-pub-sub");
const pollResults = async (app) => {
    app.get("/polls/:pollId/results", { websocket: true }, (connection, request) => {
        const getPollParams = zod_1.default.object({
            pollId: zod_1.default.string().uuid()
        });
        const { pollId } = getPollParams.parse(request.params);
        voting_pub_sub_1.voting.subscriber(pollId, (message) => {
            connection.socket.send(JSON.stringify(message));
        });
    });
};
exports.pollResults = pollResults;
