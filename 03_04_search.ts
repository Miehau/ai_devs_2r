import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { getTask, answer } from "./utils/shared";
import * as config from "./utils/config.json"
import { v4 as uuidv4 } from 'uuid';
import { QdrantClient } from "@qdrant/js-client-rest";
import { TextLoader } from "langchain/document_loaders/fs/text";
import fs from 'fs';
import { Document } from "langchain/document";

interface IArticle {
    title: string
    url: string
    info: string
    date: string
}

const COLLECTION_NAME = "ai_devs_search"

const qdrant = new QdrantClient({ url: config.qdrantUrl })
const embeddings = new OpenAIEmbeddings({ maxConcurrency: 5, openAIApiKey: config.openApiKey })


await createCollectionIfNotExists(qdrant, COLLECTION_NAME)
await createDatabaseEmbeddings(COLLECTION_NAME)

const taskData = await getTask('search')
const query = taskData.question
const queryEmbedding = await embeddings.embedQuery(query)


const result = await qdrant.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: 1
})

console.log(result)

answer(result[0].payload!.source)



async function createCollectionIfNotExists(qdrant: QdrantClient, COLLECTION_NAME: string) {
    const result = await qdrant.getCollections()
    const indexed = result.collections.find(collection => collection.name === COLLECTION_NAME)
    console.log(`Collection ${COLLECTION_NAME} exists: ${indexed ? true : false}`)
    if (!indexed) {
        qdrant.createCollection(COLLECTION_NAME, { vectors: { size: 1536, distance: 'Cosine', on_disk: true } });
        console.log(`Collection ${COLLECTION_NAME} created`)
    }
}


async function createDatabaseEmbeddings(collectionName: string) {
    const collectionInfo = await qdrant.getCollection(collectionName)
    if (!collectionInfo.points_count) {
        console.log(`Collection ${collectionName} is empty, creating embeddings`)
        const data = fs.readFileSync("./archiwum_aidevs.json", "utf8")
        let memory: [IArticle] = JSON.parse(data)

        let documents = memory.map(article => new Document({ pageContent: `${article.title}:${article.info}`, metadata: { source: article.url, title: article.title, id: uuidv4() } }))

        const points = []

        for (const document of documents) {
            const [embedding] = await embeddings.embedDocuments([document.pageContent])
            points.push({
                id: document.metadata.id,
                payload: document.metadata,
                vector: embedding
            })
        }

        qdrant.upsert(collectionName, {
            wait: true,
            batch: {
                ids: points.map(point => point.id),
                vectors: points.map(point => point.vector),
                payloads: points.map(point => point.payload)
            }
        })
    } else {
        console.log(`Collection ${collectionName} is empty, skipping creation embeddings`)
    }
}

