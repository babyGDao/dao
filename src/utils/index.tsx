import BigNumber from "bignumber.js";

export const toTokenValue = (value: any, decimals: number, mantissa?: number) => {
  if (mantissa) return new BigNumber(value).multipliedBy(10 ** decimals).toFixed(mantissa, 1);
  return new BigNumber(value).multipliedBy(10 ** decimals).toFixed();
}

export const fromTokenValue = (value: any, decimals: number, mantissa?: number) => {
  if (mantissa) return new BigNumber(value).dividedBy(10 ** decimals).toFixed(mantissa, 1);
  return new BigNumber(value).dividedBy(10 ** decimals).toFixed();
}


export const fadeInOnce = {
  initial: {
    opacity: 0,
    scale: 0,
  },
  whileInView: {
    opacity: 1,
    scale: 1,
  },
  viewport: {
    margin: '-100px',
    once: true,
  },
};

export const fadeIn = {
  initial: {
    opacity: 0,
    scale: 0,
  },
  whileInView: {
    opacity: 1,
    scale: 1,
  },
  viewport: {
    margin: '-100px',
  },
};



