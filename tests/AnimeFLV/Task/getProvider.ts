import {SpecificCap} from "../Page/SpecificCap";
import {Episode, Source} from "../Data/json";

export const getProvider = () => async (cap: Episode, page: SpecificCap) => {
    const unsupport = ["netu", "stape"];
    const capPage = await page.getListOfOptions();
    for (let option of capPage) {
        let titleOption = await page.getTitleOfOption(option);
        if (unsupport.some(name => titleOption.toLowerCase().includes(name.toLowerCase()))) {
            continue;
        }
        let videoSource = await page.getLinkToView(option);
        //console.log("🔗 Cap to get provider::", cap.title, cap.number, titleOption, videoSource);
        let source = new Source(titleOption, videoSource);
        await cap.AddSource(source);
    }
};