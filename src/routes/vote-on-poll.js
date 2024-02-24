"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteOnPoll = void 0;
const zod_1 = require("zod");
const crypto_1 = require("crypto");
const prisma_1 = require("../lib/prisma");
const redis_1 = require("../lib/redis");
const voting_pub_sub_1 = require("../utils/voting-pub-sub");
const voteOnPoll = async (app) => {
    app.post("/polls/:pollId/votes", async (request, reply) => {
        const voteOnPollId = zod_1.z.object({
            pollId: zod_1.z.string().uuid()
        });
        const voteOnPollBody = zod_1.z.object({
            pollOptionsId: zod_1.z.string().uuid()
        });
        const { pollId } = voteOnPollId.parse(request.params);
        const { pollOptionsId } = voteOnPollBody.parse(request.body);
        let { sessionId } = request.cookies;
        if (sessionId) {
            const userPreviousVoteOnPoll = await prisma_1.prisma.vote.findUnique({
                where: {
                    sessionId_pollId: {
                        sessionId,
                        pollId
                    }
                }
            });
            if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionsId !== pollOptionsId) {
                await prisma_1.prisma.vote.delete({
                    where: {
                        id: userPreviousVoteOnPoll.id
                    }
                });
                const votes = await redis_1.redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionsId);
                voting_pub_sub_1.voting.publish(pollId, {
                    pollOptionsId: userPreviousVoteOnPoll.pollOptionsId,
                    votes: Number(votes)
                });
            }
            else if (userPreviousVoteOnPoll) {
                reply.status(400).send({ message: "You already voted on this poll." });
            }
        }
        if (!sessionId) {
            const sessionId = (0, crypto_1.randomUUID)();
            reply.setCookie('sessionId', sessionId, {
                path: "/",
                maxAge: 60 * 60 * 24 * 30, // 30 days
                signed: true,
                httpOnly: true
            });
        }
        await prisma_1.prisma.vote.create({
            data: {
                sessionId,
                pollId,
                pollOptionsId
            }
        });
        const votes = await redis_1.redis.zincrby(pollId, 1, pollOptionsId);
        voting_pub_sub_1.voting.publish(pollId, {
            pollOptionsId,
            votes: Number(votes)
        });
        return reply.status(201).send();
    });
};
exports.voteOnPoll = voteOnPoll;
