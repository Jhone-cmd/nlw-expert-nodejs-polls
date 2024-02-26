"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomePage = void 0;
const welcomePage = async (app) => {
    app.get("/", async () => {
        return `
        Para consumir esta API de Polls(Enquetes), você pode usar o Insomnia, o Postman ou outra plataforma conforme o seu gosto.
        
        Ela também possui o monitoramento em tempo real da votação das opções da enquete selecionada.

        Atenciosamente,
        `;
    });
};
exports.welcomePage = welcomePage;
