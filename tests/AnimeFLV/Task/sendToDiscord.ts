import {Capitulo, Data} from "../Data/data";
import {Actor} from "../../../Actor/Actor";
import axios from 'axios';

export const sendToDiscord = () => async (actor: Actor, data: Data, caps: Capitulo[]) => {
    await actor.attemptsTo(
        async () => {
            for (const cap of caps) {
                if (data.validateNameOfAnimeToSendDiscord(cap.getTitle)) {
                    for (const viewUrl of cap.viewUrls) {
                        let response = await axios.post(data.getWebhookUrl, {
                            content: `Nuevo capitulo de\n**${cap.getTitle}**\nmiralo sin publicidad en\n${viewUrl}\n![Imagen](https://www3.animeflv.net${cap.getImage})`
                        });
                        if (response.status === 204) {
                            console.log(`Mensaje enviado a Discord: ${cap.getTitle}`);
                        }
                    }
                }
            }
        }
    );
}