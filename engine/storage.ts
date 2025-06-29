import { compressToUTF16, decompressFromUTF16, compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

interface IPreferences {
    [key: number]: number;
}

interface ICollection {
    [key: string]: number
}

type TDeck = string[];

interface ISetting {
    preferences: IPreferences,
    collection: ICollection,
    deck: TDeck
}

interface ISettingOptional {
    preferences?: IPreferences,
    collection?: ICollection,
    deck?: TDeck
}

const makeSetting = (setting: ISettingOptional): ISetting => {
    return {
        preferences: setting.preferences ?? {},
        collection: setting.collection ?? {},
        deck: setting.deck ?? []
    };
}

const decode = (input: string): ISetting => {
    const json = decompressFromUTF16(input);
    const setting = JSON.parse(json)
    return makeSetting(setting);
}

const encode = (setting: ISetting): string => {
    return compressToUTF16(JSON.stringify(setting));
}

const saveSetting = (setting: ISetting) => {
    const text = encode(setting);
    localStorage.setItem("activeSetting", text);
}

const loadSetting = () : ISetting => {
    const text = localStorage.getItem("activeSetting");
    if (!text)
    {
        return makeSetting({});
    }
    return decode(text);
}

export const setPreference = (key: number, value: number) => {
    const setting = loadSetting();
    setting.preferences[key] = value;
    saveSetting(setting);
}

export const setCollectionSingle = (card: string, amount: number) => {
    const setting = loadSetting();
    setting.collection[card] = amount;
    saveSetting(setting);
}

export const setCollectionAll = (collection: ICollection) => {
    const setting = loadSetting();
    setting.collection = collection;
    saveSetting(setting);
}

export const setDeckAll = (deck: TDeck) => {
    const setting = loadSetting();
    setting.deck = deck;
    saveSetting(setting);
}

export const clearSetting = () => {
    localStorage.removeItem("activeSetting");
}

export const assembleRestoreSQL = (): string => {
    const setting = loadSetting();

    const preferenceSQL = Object.entries(setting.preferences).reduce((a, [k, v]) => { 
        const key = parseInt(k);
        const value = parseFloat(v);
        return `${a} UPDATE config SET value=${value} WHERE uid=${key};`
    }, "")

    const collectionSQL = Object.entries(setting.collection).reduce((a, [k, v]) => { 
        const key = k.replace(/[^A-Za-z0-9 ]/g, '');
        const value = parseInt(String(v));
        return `${a} UPDATE collection SET amount=${value} WHERE card='${key}';`
    }, "")

    const deckValuesSQL = [""].concat(setting.deck).map((c) => `SELECT '${c.replace(/[^A-Za-z0-9 ]/g, '')}' AS card`).join(" UNION ALL ");
    const deckSQL = `DELETE FROM deck; INSERT INTO deck (card) SELECT t.card FROM (${deckValuesSQL}) t JOIN collection c ON t.card = c.card;`;

    return preferenceSQL + collectionSQL + deckSQL;
}

export const exportAsLink = () => {
    const setting = loadSetting();
    const param = compressToEncodedURIComponent(JSON.stringify(setting));
    return `${window.location.protocol}//${window.location.host}/?deck=${param}`;
}

export const importFromLink = (link: string) => {
    const setting = makeSetting(JSON.parse(decompressFromEncodedURIComponent(link)));
    saveSetting(setting);
}