import { ChatOpenAI } from "@langchain/openai";
import { getTask, answer } from "./utils/shared";
import * as config from "./utils/config.json";
import { HumanMessage, SystemMessage } from "langchain/schema";


const task = await getTask("tools")

const intentSchema = {
    name: 'describe_intention',
    description: `Describe the intention of user query.`,
    parameters: {
        type: 'object',
        properties: {
            tool: {
                type: 'string',
                description: `
                  Tool has to be set to either:
                  'ToDo' — When it's a task that needs to be done.
                  'Calendar' — when it's an event.
                  `,
            },
            desc: {
                type: 'string',
                description: 'Short summary'
            }, 
            date: {
                type: 'string',
                description: 'date of event in format YYYY-MM-DD. Populated only when tool is set to "Calendar"'
            }
        },
        required: ['tool, desc'],
    },
}

const model = new ChatOpenAI({openAIApiKey: config.openApiKey, modelName: 'gpt-3.5-turbo' }).bind({functions: [intentSchema]})

const modelAnswer = await model.invoke([
    new SystemMessage(`Context###\nToday is 2024-04-09###`),
    new HumanMessage(task.question)
])

console.log(JSON.parse(modelAnswer.additional_kwargs.function_call!.arguments))
answer(JSON.parse(modelAnswer.additional_kwargs.function_call!.arguments))