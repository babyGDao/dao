import BigNumber from "bignumber.js";
import { MAX_UNIT256 } from "../constants";
const dayTime = process.env.REACT_APP_DAY + ""

export function formatAccount(value: any, lenStart: number, lenEnd: number) {
    if (!value) { return ""; }
    if (!lenStart) { lenStart = 8; }
    if (!lenEnd) { lenEnd = 8; }
    return value.slice(0, lenStart) + "..." + value.slice(-lenEnd)
}

export const verify = (value: any) => {
    let str = value;
    let len1 = str.substr(0, 1);
    let len2 = str.substr(1, 1);
    if (str.length > 1 && len1 == 0 && len2 != ".") {
        str = str.substr(1, 1);
    }
    if (len1 == ".") {
        str = "";
    }
    if (str.indexOf(".") != -1) {
        let str_ = str.substr(str.indexOf(".") + 1);
        if (str_.indexOf(".") != -1) {
            str = str.substr(0, str.indexOf(".") + str_.indexOf(".") + 1);
        }
    }
    if (str.length > 1 && str.charAt(str.length - 1) == '-') {
        str = str.substr(0, str.length - 1);
    }
    return str.replace(/[^\-^\d^\.]+/g, '');
};

export const formattingDate = (timestamp: any) => {
    if (new BigNumber(timestamp.toString()).isEqualTo(MAX_UNIT256)) {
        return "自动续期"
    }

    const date = new Date(Number(timestamp.toString()) * 1000)
    const year = date.getFullYear()
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    const formattedDate = `${year}.${month}.${day}  ${hours}:${minutes}`

    return formattedDate;
}


export const ItemReward = (item: any) => {
    const timeNow = new Date().getTime() / 1000
    let days
    if (new BigNumber(timeNow).isLessThan(item.dueTime.toString())) {
        days = new BigNumber(new BigNumber(timeNow).minus(item.createTime.toString()).toString()).dividedBy(dayTime).toFixed(0,1)
    } else {
        days = new BigNumber(new BigNumber(item.dueTime.toString()).minus(item.createTime.toString()).toString()).dividedBy(dayTime).toFixed(0,1)
    }
    return new BigNumber(item.value.toString()).multipliedBy(days).multipliedBy(item.rate.toString()).dividedBy(10000).toString()
}
