"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPoll = void 0;
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
const createPoll = async (app) => {
    app.post("/polls", async (request, reply) => {
        const createPollBody = zod_1.z.object({
            title: zod_1.z.string(),
            options: zod_1.z.array(zod_1.z.string())
        });
        const { title, options } = createPollBody.parse(request.body);
        const poll = await prisma_1.prisma.poll.create({
            data: {
                title,
                options: {
                    createMany: {
                        data: options.map(option => {
                            return { title: option };
                        }),
                    }
                }
            }
        });
        return reply.status(201).send({ pollId: poll.id });
    });
};
exports.createPoll = createPoll;
