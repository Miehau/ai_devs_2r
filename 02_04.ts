import { OpenAIEmbeddings } from "@langchain/openai";
import { getTask, answer } from "./utils/shared";
import * as config from "./utils/config.json"
import OpenAI from "openai";
import fs from "fs";


const taskData = await getTask('whisper')

const model = new OpenAI({apiKey: config.openApiKey})

const transcription = await model.audio.transcriptions.create({
    file: fs.createReadStream("./mateusz.mp3"),
    model: "whisper-1"
})

console.log(transcription.text)

answer(transcription.text)