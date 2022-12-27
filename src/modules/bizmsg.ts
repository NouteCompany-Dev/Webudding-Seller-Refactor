import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

export const bizmsg = async (
    phone: string,
    templateId: string,
    message: string,
    messageType: string,
    button: any,
) => {
    try {
        const result = await axios.post(
            'https://alimtalk-api.bizmsg.kr/v2/sender/send',
            [
                {
                    message_type: messageType,
                    phn: '82' + Number(phone),
                    profile: process.env.BIZM_PROFILE_KEY,
                    tmplId: templateId,
                    msg: message,
                    reserveDt: '00000000000000',
                    button1: button,
                },
            ],
            {
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                    userid: process.env.BIZM_USER_ID,
                    Accept: 'application/json',
                },
            },
        );
        console.log(result.data);
    } catch (err) {
        console.log(err);
    }
};
