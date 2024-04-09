import { answer, getTask } from "./utils/shared";
import * as config from "./utils/config.json";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: config.openApiKey });

const taskData = await getTask('moderation')

const moderationOutput = await taskData
    .input
    .map(async (message: any) => {
        let response = await openai.moderations.create({ input: message })
        const moderationResult = response.results[0];
        console.log(`message: ${message} - moderation result: ${JSON.stringify(moderationResult,null, 2)}`)
        return JSON.stringify(moderationResult.flagged) === "true" ? 1 : 0
    })

const answerBody = await Promise.all(moderationOutput)
console.log(`moderationOutput: ${answerBody}`)

answer(answerBody)
