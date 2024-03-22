import { token, answer, getTask } from "./utils/shared";
import { ChatPromptTemplate } from "langchain/prompts";
import { ChatOpenAI, OpenAIChatInput } from "@langchain/openai"
import * as config from "./utils/config.json";
import OpenAI from "openai";
import axios from "axios";
const systemTemplate = `
You will be given a question and answer.
For answer, decide if it answers given question correctly.
If answer is unlrelated or incorrect, return 'no'.
Otherwise return 'yes'.
###
{question}
###
`

const openai = new OpenAI({ apiKey: config.openApiKey });

const taskData = await getTask('liar')

const question = "Is it true that chickens can fly backwards?"

const form = new FormData()
form.append('question', question)
const response = await axios.post(`${config.url}/task/${token}`,form, {
    headers: {
        'Accept-Encoding': 'gzip'
    }
});

console.log(response.data);

const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", "{answer}"]
]);

const formattedChatPrompt = await chatPrompt.formatMessages({
    question: question,
    answer: response.data.answer
});

const chat = new ChatOpenAI<OpenAIChatInput>({ openAIApiKey: config.openApiKey, maxTokens: 400 });
const { content } = await chat.invoke(formattedChatPrompt);
console.log(content)

answer(content)
