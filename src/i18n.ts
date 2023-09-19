import LanguageDetector from 'i18next-browser-languagedetector';
import i18n from 'i18next';
import en_US from './messages/en.json';
import zh_CN from './messages/zh.json';

import {initReactI18next} from 'react-i18next';


i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: en_US,
            },
            zh: {
                translation: zh_CN,
            }
        },
        fallbackLng: "en",
        debug: false,
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
