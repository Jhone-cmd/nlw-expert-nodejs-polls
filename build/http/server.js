"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const create_poll_1 = require("../routes/create-poll");
const get_poll_1 = require("../routes/get-poll");
const vote_on_poll_1 = require("../routes/vote-on-poll");
const poll_results_1 = require("../websocket/poll-results");
const app = (0, fastify_1.default)();
app.register(cookie_1.default, {
    secret: process.env.SECRET_COOKIE,
    hook: 'onRequest',
});
app.register(websocket_1.default);
app.register(create_poll_1.createPoll);
app.register(get_poll_1.getPoll);
app.register(vote_on_poll_1.voteOnPoll);
app.register(poll_results_1.pollResults);
app.listen({
    port: 3333
}).then(() => {
    console.log("Server is running!");
});
