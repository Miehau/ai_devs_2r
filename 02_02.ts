import * as fs from "fs";
import { token, answer, getTask } from "./utils/shared";
import { ChatPromptTemplate } from "langchain/prompts";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { ChatOpenAI, OpenAIChatInput } from "@langchain/openai"
import {TextLoader} from "langchain/document_loaders/fs/text";
import { Document } from "langchain/document";
import * as config from "./utils/config.json";
import * as dd from "./02_02_docs.json";
import OpenAI from "openai";
import axios from "axios";

const documents = dd.default

console.log(documents.map((doc:any) => doc.metadata.source).join('\n'))

const taskData = await getTask('inprompt')



const model = new ChatOpenAI({ maxConcurrency: 5, openAIApiKey : config.openApiKey })

// const documents = taskData.input.map((sentence: string) => {
//     return new Document({
//         pageContent: sentence
//     })
// });

// const informationPromiseDictionary = []

// for (const doc of documents) {
//     informationPromiseDictionary.push(
//         model.invoke([
//             new SystemMessage(`For given input, return only name of person it relates to. Return the name and nothing else.`),
//             new HumanMessage(`Document: ${doc.pageContent}`)
//         ])
//     )
// }

// const descriptions = await Promise.all(informationPromiseDictionary)

// descriptions.forEach((description, index) => {
//     documents[index].metadata.source = description.content
// })

// fs.writeFileSync("02_02_docs.json", JSON.stringify(documents, null, 2))



const question = taskData.question;

const personInQuestion = await model.invoke([
    new SystemMessage(`For given question, return name of person it relates to. Return only name and nothing more.`),
    new HumanMessage(`Question: ${question}`)
])

console.log(`Person in question: ${personInQuestion.content}`)

const response = await model.invoke([
    new SystemMessage(`You will answer question short and truthfully given context below. Answer as short as you can (preferably in one word) in polish language.
    Context###
    ${documents.filter((doc : any) => doc.metadata.source == personInQuestion.content).map((doc : any) => doc.pageContent)}
    ###
    Question###
    `),
    new HumanMessage(`${question}`)
])

console.log(`Used context: ${documents.filter((doc : any) => doc.metadata.source == personInQuestion.content).map((doc : any) => doc.pageContent)}`)
console.log(`Response: ${response.content}`)

answer(response.content)