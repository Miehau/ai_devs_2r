import { OpenAIEmbeddings } from "@langchain/openai";
import { getTask, answer } from "./utils/shared";
import * as config from "./utils/config.json"



const taskData = await getTask('embedding')


const embeddingsModel = new OpenAIEmbeddings({ modelName: "text-embedding-ada-002", openAIApiKey: config.openApiKey })

const response = await embeddingsModel.embedQuery("Hawaiian pizza")

console.log(JSON.stringify(response.length))

answer(response)