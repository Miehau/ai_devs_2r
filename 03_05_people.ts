import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { getTask, answer } from "./utils/shared";
import * as config from "./utils/config.json"
import { v4 as uuidv4 } from 'uuid';
import { QdrantClient } from "@qdrant/js-client-rest";
import { TextLoader } from "langchain/document_loaders/fs/text";
import fs from 'fs';
import { Document } from "langchain/document";
import { BaseMessageChunk, HumanMessage, SystemMessage } from "langchain/schema";

interface IPerson {
    imie: string
    nazwisko: string
    wiek: number
    o_mnie: string
    ulubiona_postac_z_kapitana_bomby: string
    ulubiony_serial: string
    ulubiony_film: string
    ulubiony_kolor: string
}


const peopleData = fs.readFileSync("./people.json", "utf8");
const people : {id: string, data: IPerson}[] = JSON.parse(peopleData).map((person: IPerson) => { return { id: `${person.imie} ${person.nazwisko}`, data: person } });


const task = await getTask("people")

const model = new ChatOpenAI({ openAIApiKey: config.openApiKey, modelName: "gpt-3.5-turbo" })

const nameAndSurname = await model.invoke([
    new HumanMessage("You will extract and provide only a name and surname in its basic form from following question. If it's shortened, it needs to converted to full, official name, e.g. Tomek needs to be converted to Tomasz, Michaś into Michał, Krysia into Krystyna. Put extra care converting surnames not to misspell them. Do not return anything else, only name and surname"),
    new HumanMessage(task.question)
])
console.log(nameAndSurname.content)
console.log(`Data for ${nameAndSurname.content}: ${people.filter(p => p.id === nameAndSurname.content).map(p => JSON.stringify(p.data))}`)


const response = await model.invoke([
    new HumanMessage(`Answer the following question briefly and concisely using following context. Context###${people.filter(p => p.id === nameAndSurname.content).map(p => JSON.stringify(p.data))}###`),
    new HumanMessage(task.question)
])

console.log(response)


answer(response.content)