import { SpecificCap } from "../Page/SpecificCap";
import { Episode, Source } from "../Data/json";

export const getProvider = () => async (cap: Episode, page: SpecificCap) => {
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
        console.log("🔗 Cap to get provider::", cap.title, cap.number, titleOption, videoSource);
        let source = new Source(titleOption, videoSource);
        await cap.AddSource(source);
    }
};