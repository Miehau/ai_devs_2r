import { ChatOpenAI } from "@langchain/openai";
import { getTask, answer } from "./utils/shared";
import * as config from "./utils/config.json"
import axios from "axios";
import { HumanMessage, SystemMessage } from "langchain/schema";

type ArticleResponse = {
    success: boolean,
    content: string
}
const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", openAIApiKey: config.openApiKey, maxTokens: 400 })
const gpt4Model = new ChatOpenAI({ modelName: "gpt-4", openAIApiKey: config.openApiKey, maxTokens: 400 })


const taskData = await getTask('scraper')
const article = await fetchArticle(taskData.input);
const system = createSystemMessage(article.content);


console.log("Sending message to OpenAI")
const response = await model.invoke([
    new SystemMessage(system),
    new HumanMessage(taskData.question)
])
console.log(response.content)

await answer(response.content.slice(0, 200))
    .catch(async _ => {
        const gpt4Answer = await gpt4Model.invoke([
            new SystemMessage(system),
            new HumanMessage(taskData.question)
        ]);
        answer(gpt4Answer.content.slice(0, 200))
    })




// functions




function createSystemMessage(article: string) {
    return `
    Hey! I am a culinary chef. I will provide brief and concise answers to questions.
    I will only use context as source of information. If I don't know the answer, I will truthfully say 'I don't know'.
    Response needs to be in polish language.
    
    Context###
    ${article}
    ###
    
    Question###
    `;
}


function fetchArticle(url: string): Promise<ArticleResponse> {
    return fetchDataFromURL(url).then((data) => {
        if (!data.success) {
            console.log('Failed to fetch article');
            throw new Error('Failed to fetch article');
        }
        console.log("Received article")
        return data;
    });
}

async function fetchDataFromURL(url: string): Promise<ArticleResponse> {
    const headers = { 'Accept-Encoding': 'gzip', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' };
    try {
        const response = await axios.get(url, { headers });
        return { success: true, content: response.data };

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, content: '' };
    }
}



