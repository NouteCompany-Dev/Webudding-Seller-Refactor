import * as crypto from 'crypto';

export const GenDigestPwd = (password: string) => {
    let digestPwd = crypto.createHash('sha256').update(password).digest('hex');
    digestPwd = crypto.createHash('sha256').update(digestPwd).digest('hex');
    digestPwd = crypto.createHash('sha256').update(digestPwd).digest('hex');
    return digestPwd;
};

export const genUuid = (callback) => {
    if (typeof callback !== 'function') {
        return uuidFromBytes(crypto.randomBytes(16));
    }

    crypto.randomBytes(16, function (err, rnd) {
        if (err) return callback(err);
        callback(null, uuidFromBytes(rnd));
    });
};

export const uuidFromBytes = (rnd) => {
    rnd[6] = (rnd[6] & 0x0f) | 0x40;
    rnd[8] = (rnd[8] & 0x3f) | 0x80;
    rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
    rnd.shift();
    return rnd.join('-');
};

export const genFileName = () => {
    const buf = crypto.randomBytes(32);
    return buf.toString('hex');
};

export const rsaEncrypt = (str: string) => {
    if (str === '' || str == null) {
        return '';
    } else {
        const key = process.env.rsa_public;
        let crpto = crypto.publicEncrypt(
            { key: key, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
            Buffer.from(str),
        );
        let crptostr = crpto.toString('base64');
        return crptostr;
    }
};

export const rsaDencrypt = (str: string) => {
    if (str === '' || str == null) {
        return '';
    } else {
        const key = process.env.rsa_private;
        let crpto = crypto.privateDecrypt(
            { key: key, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
            Buffer.from(str, 'base64'),
        );
        let decrptostr = crpto.toString('utf-8');
        return decrptostr;
    }
};

export const aesEncrypt = (str: string) => {
    if (str === '' || str == null) {
        return '';
    } else {
        const key = process.env.aes_key;
        const iv = process.env.aes_iv;
        const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        let crpto = cipher.update(str, 'utf8', 'base64') + cipher.final('base64');
        let crptostr = crpto.toString();
        return crptostr;
    }
};

export const aesDencrypt = (str: string) => {
    if (str === '' || str == null) {
        return '';
    } else {
        const key = process.env.aes_key;
        const iv = process.env.aes_iv;
        const cipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        let crpto = cipher.update(str, 'base64', 'utf8') + cipher.final('utf8');
        let decrptostr = crpto.toString();
        return decrptostr;
    }
};
