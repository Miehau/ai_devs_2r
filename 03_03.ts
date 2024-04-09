import { ChatOpenAI } from "@langchain/openai";
import { getTask, answer } from "./utils/shared";
import * as config from "./utils/config.json"

import axios from "axios";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { sleep } from "openai/core";

const hints: string[] = []
function getSystemMessage(hints: string[]): string {
    return `
    I am a parcipant in the "Who am I" task. I will be given hints about a person and will need to guess who that person is.
    I will reply briefly and concisely. If I don't know the answer, I will truthfully say "don't know".
    I will use hints to guess who the person is.

    After each prompt I will return one word answer:
    - Yes, if I know who I am
    - No, if I don't know who I am
    
    For question "Who am I?", I will return the answer ignoring previous rules.
    
    Context###
    Today is ${new Date().toLocaleDateString()}
    ###
    Hints###
    ${hints.join('\n')}
    ###
    `
}
const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", openAIApiKey: config.openApiKey, maxTokens: 400 })
const gpt4Model = new ChatOpenAI({ modelName: "gpt-4", openAIApiKey: config.openApiKey, maxTokens: 400 })

const taskData = await getTask('whoami')
hints.push(taskData.hint)
let doIKnow = false
while (!doIKnow) {
    const system = getSystemMessage(hints)
    const response = await model.invoke([
        new SystemMessage(system)
    ])

    console.log(`Response: ${response.content}. Hints: ${hints.join(', ')}`)

    if ((response.content as string).includes("Yes")) {
        doIKnow = true
    } else {
        const newTask = await getTask('whoami')
        hints.push(newTask.hint)
    }
    await sleep(2000);
}
await getTask('whoami')
const response = await model.invoke([
    new SystemMessage(getSystemMessage(hints)),
    new HumanMessage("Who am I?")
])

answer(response.content)




