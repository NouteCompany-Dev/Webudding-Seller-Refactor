export const tel = '^[0-9]{8,11}$';
export const phone = '^01([016789]?)([0-9]{3,4})([0-9]{4})$';
export const zipcode = '^[0-9]+';

export const password = {
    master: '^[0-9a-zA-Z!@#$%^&*()?+-_~=/]{6,40}$',
    seller: '^[0-9a-zA-Z!@#$%^&*()?+-_~=/]{6,20}$',
    user: '^(?=.*[a-z])(?=.*\\d)(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&]{8,40}',
};
