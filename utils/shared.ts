import axios from 'axios';
import * as config from './config.json';

export var token = "";

async function authenticate(taskName: string): Promise<string> {
    try {
        console.log("Fetching token...")
        const apiKey = config.apiKey;
        const response = await axios.post(`${config.url}/token/${taskName}`, {
            "apikey": apiKey
        }, {
            headers: {
                'Accept-Encoding': 'gzip'
            }
        });
        console.log("Successfully fetched token.")
        token = await response.data.token;
        return response.data.token;
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
}


export async function getTask(taskName: string): Promise<any> {
    await authenticate(taskName)
    try {
        console.log("Fetching task...")
        const response = await axios.get(`${config.url}/task/${token}`, 
        {
            headers: {
                'Accept-Encoding': 'gzip'
            }
        });
        console.log("Fetching task returned following data:");
        console.log(response.data);

        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error.data);
        throw error;
    }
}

export async function answer(answer: any): Promise<any> {
    try {
        console.log("Sending an answer...")
        const response = await axios.post(`${config.url}/answer/${token}`,
         { "answer":  answer }, {
            headers: {
                'Accept-Encoding': 'gzip'
            }
        });
        console.log("Sending an answer returned following data:")
        console.log(response.data)
        return await response.data;
    } catch (error) {
        console.error('Error calling external API:', error.response.data);
        throw error;
    }
}
