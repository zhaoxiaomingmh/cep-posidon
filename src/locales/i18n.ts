import i18n from "i18next";
import { Translation, initReactI18next } from "react-i18next";
import en from "./lan/en.json";
import cn from "./lan/cn.json";
import jp from "./lan/jp.json";

const resources = {
    en: {
        translation: en
    },
    cn: {
        translation: cn
    },
    jp: {
        translation: jp
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "cn",
        fallbackLng: 'cn',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;