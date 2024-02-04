
export const randomInt = (max = 1000) => Math.floor(Math.random() * max);

export const round = (value, toNearest = 1) => Math.round(value/toNearest) * toNearest;
