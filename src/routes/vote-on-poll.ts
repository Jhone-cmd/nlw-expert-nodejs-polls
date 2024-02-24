import { FastifyInstance } from "fastify";
import { string, z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "../lib/prisma";
import { resolve } from "path";
import { redis } from "../lib/redis";
import { voting } from "../utils/voting-pub-sub";


export const voteOnPoll = async ( app: FastifyInstance ) => {
    
    app.post("/polls/:pollId/votes", async (request, reply) => {

        const voteOnPollId = z.object({
            pollId: z.string().uuid()
        });

        const voteOnPollBody = z.object({
            pollOptionsId: z.string().uuid()
        });       
    
        const { pollId } = voteOnPollId.parse(request.params);
        const { pollOptionsId } = voteOnPollBody.parse(request.body);

        let { sessionId } = request.cookies;

        if(sessionId) {

            const userPreviousVoteOnPoll = await prisma.vote.findUnique({
                where: {
                    sessionId_pollId: {
                        sessionId,
                        pollId
                    }
                }
            });

            if(userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionsId  !== pollOptionsId) {
                await prisma.vote.delete({
                    where: {
                        id: userPreviousVoteOnPoll.id
                    }
                });

               const votes =  await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionsId);

               voting.publish(pollId, {
                    pollOptionsId: userPreviousVoteOnPoll.pollOptionsId,
                    votes: Number(votes)
               });
                
            } else if (userPreviousVoteOnPoll) {
                reply.status(400).send({ message: "You already voted on this poll." })
            }
        }

        if(!sessionId) {

            const sessionId = randomUUID();
            
            reply.setCookie( 'sessionId', sessionId , {
                path: "/", 
                maxAge: 60 * 60 * 24 * 30, // 30 days
                signed: true,
                httpOnly: true 
            });
        }   

        await prisma.vote.create({
            data: {
                sessionId,
                pollId,
                pollOptionsId
            }
        });

        const votes = await redis.zincrby(pollId, 1, pollOptionsId);

        voting.publish(pollId, {
            pollOptionsId,
            votes: Number(votes)
        });
        
        return reply.status(201).send();
    
    });
}