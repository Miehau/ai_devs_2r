import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { getTask, answer } from "./utils/shared";
import * as config from "./utils/config.json"
import { v4 as uuidv4 } from 'uuid';
import { QdrantClient } from "@qdrant/js-client-rest";
import { TextLoader } from "langchain/document_loaders/fs/text";
import fs from 'fs';
import { Document } from "langchain/document";
import { BaseMessageChunk, HumanMessage, SystemMessage } from "langchain/schema";
interface IRate {
    currenct: string,
    code: string,
    mid: number
}
const task = await getTask("knowledge")

const model = new ChatOpenAI({openAIApiKey: config.openApiKey, modelName: 'gpt-3.5-turbo' })
const category = await model.invoke([
    new SystemMessage(`For given input, put it into one of three categories:
     'general_knowledge', 'currency_exchange' or 'country_population'. 
     Return response as JSON with two fields: 'category' described above and 'context'.
     Context should be populated as below:
     - if category is 'general_knowledge', context should be the question itself.
     - if category is 'currency_exchange', context should be the currency code.
     - if category is 'country_population', context should be the country name in english.
     `),
    new HumanMessage(task.question)
])
console.log(category.content)

const categorisedData = JSON.parse(category.content.toString())

switch(categorisedData.category) {
    case 'general_knowledge':
        const gkResponse = await model.invoke([
            new HumanMessage(categorisedData.context)
        ])
        console.log(gkResponse.content)
        answer(gkResponse.content)
        break;
    case 'currency_exchange':
        const response = await fetch("http://api.nbp.pl/api/exchangerates/tables/A");
        const data = await response.json();
        const rate = data[0].rates.filter((rate: IRate) => rate.code === categorisedData.context).map((rate: IRate) => rate.mid)[0]
        console.log(rate);
        answer(rate)
        break;
    case 'country_population':
        const popResponse = await fetch(`https://restcountries.com/v3.1/name/${categorisedData.context}`);
        const popData = await popResponse.json();
        const population = popData[0].population
        console.log(population);
        answer(population)
        break;
    default:
        throw new Error("Invalid category")
}