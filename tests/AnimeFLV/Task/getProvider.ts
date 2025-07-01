import { SpecificCap } from "../Page/SpecificCap";
import { Episode, Source } from "../Data/json";

export const getProvider = () => async (cap: Episode, page: SpecificCap) => {
    try {
        const unsupport = ["netu", "stape", "Fembed"];
        const capPage = await page.getListOfOptions();

        if (!capPage || capPage.length === 0) {
            console.warn(`⚠️ No hay opciones de video para el episodio ${cap.title} (${cap.number})`);
            return;
        }

        for (let option of capPage) {
            let titleOption = await page.getTitleOfOption(option);
            if (!titleOption || unsupport.some(name => titleOption.toLowerCase().trim().includes(name.toLowerCase().trim()))) {
                continue;
            }
            console.log("🔗 Cap provider::", await option.textContent(), titleOption, cap.number);
            let videoSource = await page.getLinkToView(option);
            if (videoSource === '') {
                console.warn(`⚠️ No se pudo obtener el enlace de video para el episodio ${cap.title} (${cap.number}) con la opción ${titleOption}`);
                continue;
            }
            console.log("🔗 Cap to get provider::", cap.title, cap.number, titleOption, videoSource);
            let source = new Source(titleOption, videoSource);
            await cap.AddSource(source);
        }
    } catch (error) {
        console.error(`Error en getProvider para el episodio ${cap.title} (${cap.number}):`, error);
    }
};