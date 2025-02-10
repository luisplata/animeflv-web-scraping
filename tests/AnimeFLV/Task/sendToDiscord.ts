import { Capitulo, Data } from "../Data/data";
import { Actor } from "../../../Actor/Actor";
import axios from 'axios';

export const sendToDiscord = () => async (actor: Actor, webhook: string, caps: Capitulo[]) => {
    await actor.attemptsTo(
        async () => {
            console.log(`Data para enviar a Discord: ${JSON.stringify(caps)} al webhook: ${webhook}`);
            for (const cap of caps) {
                for (const viewUrl of cap.viewUrls) {
                    try {

                        let response = await axios.post(webhook, {
                            content: `Nuevo capitulo de\n**${cap.getTitle}**\nmiralo sin publicidad en\n${viewUrl}\n![Imagen](${cap.getImage})`
                        });
                        if (response.status === 204) {
                            console.log(`Mensaje enviado a Discord: ${cap.getTitle}`);
                        } else {
                            console.log(`Error al enviar mensaje a Discord: ${response.status}`);
                        }
                    } catch (e) {
                        console.log(`Error al enviar mensaje ${cap.getTitle} a Discord: ${e}`);
                    }
                }
            }
        }
    );
}
