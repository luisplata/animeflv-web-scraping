import {Actor} from "../../../Actor/Actor";
import axios from 'axios';

export const sendToDiscord = () => async (actor: Actor, webhook: string, caps: any) => {
    await actor.attemptsTo(
        async () => {
            //console.log(`Data para enviar a Discord: ${JSON.stringify(caps)} al webhook: ${webhook}`);

            const promises = caps.flatMap(cap =>
                cap.viewUrls.map(async viewUrl => {
                    try {
                        const response = await axios.post(webhook, {
                            content: `Nuevo capítulo de\n**${cap.getTitle}**\nMíralo sin publicidad en\n${viewUrl}\n![Imagen](${cap.getImage})`
                        });
                        if (response.status === 204) {
                            console.log(`Mensaje enviado a Discord: ${cap.getTitle}`);
                        } else {
                            console.log(`Error al enviar mensaje a Discord: ${response.status}`);
                        }
                    } catch (e) {
                        console.log(`Error al enviar mensaje ${cap.getTitle} a Discord: ${e}`);
                    }
                })
            );

            await Promise.all(promises);
        }
    );
};
