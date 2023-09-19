import BigNumber from "bignumber.js";

export const convertNormal = (v: any, v2?: any) => {
    if (!v2) {
        v2 = 18
    }
    if (v) {
        return new BigNumber(v).dividedBy(10**v2).toString(10)
    } else {
        return new BigNumber(0).toString(10)
    }
};

export const convertNormalFix = (v: any, v2?: any, v3?:number) => {
    if (!v2) {
        v2 = 10 ** 18
    }
    if (!v3) {
        v3 = 0
    }
    if (v) {
        return new BigNumber(v).dividedBy(10**v2).toFixed(v3).toString()
    } else {
        return new BigNumber(0).toFixed(v3).toString()
    }
};

export const multiplyNormal = (v: any, v2?: any) => {
    if (!v2) {
        v2 = 10 ** 18
    }
    if (v) {
        return new BigNumber(v).multipliedBy(10**v2).toString(10)
    } else {
        return new BigNumber(0).toString(10)
    }
};

export const multiplyNormalFix = (v: any, v2?: any, v3?:number) => {
    if (!v2) {
        v2 = 10 ** 18
    }
    if (!v3) {
        v3 = 0
    }
    if (v) {
        return new BigNumber(v).multipliedBy(10**v2).toFixed(v3).toString()
    } else {
        return new BigNumber(0).toFixed(v3).toString()
    }
};



export const convert = (v: any, v2?: any) => {
    if (!v2) {
        v2 = 10 ** 18
    }
    if (v) {
        return new BigNumber(v).dividedBy(v2).toFixed(0)
    } else {
        return new BigNumber(0).toFixed(0)
    }
};

export const convertAndFix = (v: any, fixNum: number) => {
    if (v) {
        return new BigNumber(v).dividedBy(10 ** 18).toFixed(fixNum, 1)
    } else {
        return new BigNumber(0).toFixed(fixNum)
    }
};

export const convertFix = (v: any, v2: any, fixNum: number) => {
    if (v) {
        return new BigNumber(v).dividedBy(v2).toFixed(fixNum, 1)
    } else {
        return new BigNumber(0).toFixed(fixNum)
    }
};

export const multiply = (v: any, v2?: any) => {
    if (!v2) {
        v2 = 10 ** 18
    }
    if (v) {
        return new BigNumber(new BigNumber(v).multipliedBy(v2).toFixed(0))
    } else {
        return new BigNumber(new BigNumber(0).toFixed(0))
    }
};


export const toValue = (v: number, d: number) => {
    if (!d) {
        d = 18
    }
    if (v) {
        return new BigNumber(v).multipliedBy(new BigNumber(10).pow(d));
    } else {
        return new BigNumber(0)
    }
}