import { ChatPromptTemplate } from "langchain/prompts";
import { ChatOpenAI, OpenAIChatInput } from "@langchain/openai"
import { answer, getTask } from "./utils/shared";
import * as config from "./utils/config.json";

const systemTemplate = `
As a {role}, generate a short article about provided subject. 
You will receive a list of article titles, that you will expand on.
Return article in polish language.
Do not return provided titles.
Output should be structured as JSON object with 'blog' key including array of strings. Each element of array should be a paragraph.
`

const taskData = await getTask('blogger')

const chatPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", "{text}"]
]);

const formattedChatPrompt = await chatPrompt.formatMessages({
    role: "Mean Food Blogger",
    text: taskData.blog.map(it => `\n${it}`).join('')
});

const chat = new ChatOpenAI<OpenAIChatInput>({ openAIApiKey: config.openApiKey, maxTokens: 3000 });
const { content } = await chat.invoke(formattedChatPrompt);
const parsedContent = JSON.parse(content)
console.log(parsedContent)

answer(parsedContent)
