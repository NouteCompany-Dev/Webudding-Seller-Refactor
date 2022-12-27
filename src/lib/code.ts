import crypto from 'crypto';

export interface IPasswordHash {
    password: string;
    salt: string;
}

export const passwordIterations = {
    master: 133342,
    seller: 113252,
    user: 123342,
};

export function generateRandomCode(digit: number): number {
    const max = 10 ** digit;
    const min = 10 ** (digit - 1);
    return Math.floor(Math.random() * (max - min) + min);
}

export function generateRandomHash(length: number): string {
    return crypto
        .randomBytes(length)
        .toString('base64')
        .replace(/[^A-Za-z0-9]/g, '');
}

export function verifyPassword(password: string, hash: string, salt: string, iterations: number): boolean {
    try {
        const key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
        return key.toString('base64') === hash;
    } catch (err) {
        return false;
    }
}

export const createPasswordHash = (password: string, iterations: number): IPasswordHash => {
    try {
        const salt = generateRandomHash(64);
        const key = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
        return {
            password: key.toString('base64'),
            salt,
        };
    } catch (err) {
        throw err;
    }
};

export const checkNull = (str) => {
    if (typeof str === undefined || str === null || str === '') {
        return true;
    } else {
        return false;
    }
};

export const maskingName = (name: string) => {
    let originStr: string = name;
    let maskingStr: string = null;
    let strLength: number = 0;
    if (checkNull(originStr) == true) {
        return originStr;
    }
    strLength = originStr.length;
    if (strLength < 3) {
        maskingStr = originStr.replace(/(?<=.{1})./gi, '*');
    } else {
        maskingStr = originStr.replace(/(?<=.{2})./gi, '*');
    }
    return maskingStr;
};
