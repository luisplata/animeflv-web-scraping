import axios from 'axios';
import * as fs from 'fs/promises';

export async function SendJsonToWebHook(url_webhook: string, path_json: string, headers: { [key: string]: string }): Promise<void> {
    try {
        console.log(url_webhook, path_json);
        const jsonData = await fs.readFile(path_json, 'utf-8');
        const parsedData = JSON.parse(jsonData);

        await axios.post(url_webhook, parsedData, {
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        });

        console.log('JSON sent successfully');
    } catch (error) {
        console.error('Error sending JSON:', error);
    }
}