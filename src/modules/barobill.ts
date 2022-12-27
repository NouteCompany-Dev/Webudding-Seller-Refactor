import * as soap from 'soap';

module.exports = {
    async createClient(uri) {
        return await new Promise(async (resolve, reject) => {
            try {
                await soap.createClient(uri, function (err, client) {
                    if (err) reject(err);
                    else resolve(client);
                });
            } catch (err) {
                reject(err);
            }
        });
    },
};
