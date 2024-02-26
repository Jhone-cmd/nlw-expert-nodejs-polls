import { FastifyInstance } from "fastify";

export const welcomePage = async (app: FastifyInstance) => {
    app.get("/", async () => {
        return `
        Para consumir esta API de Polls(Enquetes), você pode usar o Insomnia, o Postman ou outra plataforma conforme o seu gosto.
        
        Ela também possui o monitoramento em tempo real da votação das opções da enquete selecionada.

        Atenciosamente,
        ` 
})};   