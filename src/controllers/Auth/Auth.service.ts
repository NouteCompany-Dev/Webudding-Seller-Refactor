import { SellerRepository } from 'src/repository/Seller.repository';
import { BrandNameCheckReqDto, EnglishBrandNameCheckReqDto } from './dto/req/GetBrandNameReq.dto';
import { Injectable, Logger } from '@nestjs/common';
import { GenDigestPwd } from 'src/lib/crypto';
import { LoginSellerReqDto } from './dto/req/LoginSellerReq.dto';
import * as dotenv from 'dotenv';
dotenv.config();
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import {
    AddInfoEnglishSellerReqDto,
    AddInfoSellerReqDto,
    RegisterEnglishSellerReqDto,
    RegisterSellerReqDto,
} from './dto/req/RegisterSellerReq.dto';
import { RenewTokenReqDto } from './dto/req/RenewTokenReq.dto';
import { jwtCreate } from 'src/modules/jwt-create';
import axios from 'axios';
import { BaroBillReqDto, DanalReqDto, PopbillReqDto } from './dto/req/ThirdPartyReq.dto';
import { AddBusinessInfoReqDto } from './dto/req/AddBusinessInfo.req.dto';
import { confirmPopbillAccountReqDto } from './dto/req/ConfirmPopbillAccount.req.dto';
import { BusinessOption, SellerStatus, SellerType } from 'src/entity/enum/enum';
import { MailChimpService } from 'src/lib/mailChimp/mailChimp.service';
import { MailService } from 'src/modules/mail/mail.service';
import { SellerInfoRepository } from 'src/repository/sellerInfo.repository';
import { SellerPopbillAccountRepository } from 'src/repository/sellerPopbillAccount.repository';
import { cloudfrontPath } from 'src/modules/cloudfront';
import { SellerFileRepository } from 'src/repository/sellerFile.repository';
import { SellerMinorFileRepository } from 'src/repository/sellerMinorFile.repository';
import { TemporaryProductRepository } from 'src/repository/temporaryProduct.repository';

@Injectable()
export class AuthService {
    constructor(
        private mailChimpService: MailChimpService,
        private mailService: MailService,
        // Repository
        private sellerRepository: SellerRepository,
        private sellerInfoRepository: SellerInfoRepository,
        private sellerPopbillAccountRepository: SellerPopbillAccountRepository,
        private sellerFileRepository: SellerFileRepository,
        private sellerMinorFileRepository: SellerMinorFileRepository,
        private temporaryProductRepository: TemporaryProductRepository,
    ) {}

    async register(body: RegisterSellerReqDto): Promise<any> {
        try {
            Logger.log(`API - Seller Register ${body.email}`);
            let data = null;
            let status = 0;
            let resultCode = 0;
            const { name, email, phone, businessOption, bankAccount } = body;
            const checkEmail = await this.sellerRepository.checkEmail(email);
            const checkPhone = await this.sellerRepository.checkPhone(phone);
            const checkBankAccount = await this.sellerRepository.checkBankAccount(bankAccount);

            if (checkEmail) {
                status = 201;
                resultCode = 6001;
            } else if (checkPhone != null) {
                status = 202;
                resultCode = 6002;
            } else if (checkBankAccount) {
                status = 203;
                resultCode = 6003;
            } else {
                if (businessOption == BusinessOption.personal) {
                    await this.personalRegister(body);

                    const mail = await this.mailChimpService.registerTemplate(name, email);
                    Logger.log(mail === 'sent' ? 'Register MailChimp Success' : 'Register MailChimp Fail');
                } else {
                    await this.businessRegister(body);

                    const mail = await this.mailChimpService.registerTemplate(name, email);
                    Logger.log(mail === 'sent' ? 'Register MailChimp Success' : 'Register MailChimp Fail');
                }

                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { resultCode: 6006, data: null };
        }
    }

    async enRegister(body: RegisterEnglishSellerReqDto): Promise<any> {
        try {
            Logger.log(`API - English Seller Register ${body.email}`);
            let data = null;
            let status = 0;
            let resultCode = 0;
            const { name, email, phone } = body;
            const checkPhone = await this.sellerRepository.checkPhone(phone);

            if (checkPhone != null) {
                status = 203;
                resultCode = 6007;
            } else {
                await this.englishRegister(body);

                const mail = await this.mailChimpService.enRegisterTemplate(name, email);
                Logger.log(mail === 'sent' ? 'Register MailChimp Success' : 'Register MailChimp Fail');

                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { resultCode: 6008, data: null };
        }
    }

    async verifyEmail(body: any): Promise<any> {
        try {
            let resultCode = 0;
            let data = null;
            let status = 0;
            const checkIsEmailExisted = await this.sellerRepository.checkEmail(body);

            if (checkIsEmailExisted) {
                status = 201;
                resultCode = 6006;
            } else {
                const emailRes = await this.mailService.sendEmail(body);
                const code = emailRes;
                data = null;

                if (code !== null && code !== '') {
                    status = 200;
                    resultCode = 1;
                    data = code;
                }
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: -1, data: null };
        }
    }

    async login(body: LoginSellerReqDto): Promise<any> {
        try {
            Logger.log(`API - Seller Login ${body.email}`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const { email, password } = body;
            const seller = await this.sellerRepository.findByEmail(email);

            if (seller === undefined) {
                return { status: 201, resultCode: 6011, data: null };
            }

            const sellerId = seller.id;
            const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
            const hashPassword = GenDigestPwd(password);
            const sellerJwtSecret = process.env.SELLER_JWT_SECRET_KEY;
            const accessToken = jwt.sign({ sellerId }, sellerJwtSecret, { expiresIn: '1h' });
            const refreshToken = jwt.sign({ sellerId }, sellerJwtSecret, { expiresIn: '1d' });

            if (seller.password != hashPassword) {
                status = 202;
                resultCode = 6012;
            } else if (seller.enable != true) {
                status = 203;
                resultCode = 6013;
            } else if (seller.status == SellerStatus.required) {
                let sellerType = sellerInfo.sellerType;
                data = { sellerId, sellerType };
                status = 204;
                resultCode = 6014;
            } else if (seller.status == SellerStatus.registered) {
                let sellerType = sellerInfo.sellerType;
                data = sellerType;
                status = 205;
                resultCode = 6015;
            } else if (seller.status == SellerStatus.rejected) {
                data = {
                    accessToken,
                    refreshToken,
                };
                status = 206;
                resultCode = 6016; // 반려 계정 && 로그인 가능
            } else {
                data = {
                    accessToken,
                    refreshToken,
                };
                status = 200;
                resultCode = 1; // 승인된 계정
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6017, data: null };
        }
    }

    async addInfo(files: File[], body: AddInfoSellerReqDto): Promise<any> {
        try {
            Logger.log(`API - Seller Add Info`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const { brandName, englishBrandName } = body;
            const brandNameCheck = await this.sellerRepository.checkBrandName(brandName);
            const englishBrandNameCheck = await this.sellerRepository.checkEnglishBrandName(
                englishBrandName,
            );

            if (brandNameCheck) {
                status = 201;
                resultCode = 6021;
            } else if (englishBrandNameCheck) {
                status = 202;
                resultCode = 6022;
            } else {
                await this.addSellerInfo(files, body);
                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6023, data: null };
        }
    }

    async enAddInfo(files: File[], body: AddInfoEnglishSellerReqDto): Promise<any> {
        try {
            Logger.log(`API - English Seller Add Info`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const { englishBrandName } = body;
            const englishBrandNameCheck = await this.sellerRepository.checkEnglishBrandName(
                englishBrandName,
            );

            if (englishBrandNameCheck) {
                status = 201;
                resultCode = 6024;
            } else {
                this.addEnglishSellerInfo(files, body);
                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6025, data: null };
        }
    }

    async brandNameCheck(body: BrandNameCheckReqDto): Promise<any> {
        try {
            Logger.log(`API - Seller Brand Name Check`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const { brandName } = body;
            const seller = await this.sellerRepository.checkBrandName(brandName);

            if (seller != null) {
                status = 201;
                resultCode = 6031; //중복 있음
            } else {
                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6032, data: null };
        }
    }

    async enBrandNameCheck(body: EnglishBrandNameCheckReqDto): Promise<any> {
        try {
            Logger.log(`API - Seller English Brand Name Check`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const { englishBrandName } = body;
            const seller = await this.sellerRepository.checkEnglishBrandName(englishBrandName);

            if (seller) {
                status = 201;
                resultCode = 6033; //중복 있음
            } else {
                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6034, data: null };
        }
    }

    async emailCheck(body: any): Promise<any> {
        try {
            Logger.log(`API - Seller Email Check`);
            let status = 0;
            let resultCode = 0;
            let data = null;
            const seller = await this.sellerRepository.checkEmail(body);

            if (seller) {
                status = 201;
                resultCode = 6035; // 이메일 존재
            } else {
                status = 200;
                resultCode = 1;
            }

            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6036, data: null };
        }
    }

    async renewToken(body: RenewTokenReqDto): Promise<any> {
        try {
            Logger.log(`API - Seller Renew Token`);
            let status: number = 0;
            let data: object = null;
            let resultCode: number = 0;
            const { refreshToken } = body;
            const jwtSecret = process.env.SELLER_JWT_SECRET_KEY;

            jwt.verify(refreshToken, jwtSecret, (err, seller: any) => {
                if (err) {
                    Logger.log('API - TOKEN_EXPIRE');
                    status = 403;
                    resultCode = -30;
                } else {
                    Logger.log('API - RENEW TOKEN');
                    const sellerId: number = seller.sellerId;
                    const token = jwtCreate(sellerId);
                    status = 200;
                    resultCode = 1;
                    data = {
                        accessToken: token.accessToken,
                        refreshToken: token.refreshToken,
                    };
                }
            });

            return { status: status, data: { resultCode: resultCode, data: data } };
        } catch (err) {
            console.log(err);
            return { status: 401, data: { resultCode: -1, data: null } };
        }
    }

    async getTokenDanal(): Promise<any> {
        try {
            Logger.log(`API - Get Danal Token`);
            const getToken = await axios.post(
                'https://api.iamport.kr/users/getToken',
                {
                    imp_key: process.env.IAMPORT_API_KEY,
                    imp_secret: process.env.IAMPORT_SECRET_KEY,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
            const { access_token } = getToken.data.response;
            return access_token;
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6041, data: null };
        }
    }

    async getCertificationsDanal(body: DanalReqDto, getToken: string): Promise<any> {
        try {
            Logger.log(`API - Get Phone Certification`);
            const { impUid } = body;
            const getCertification = await axios.get(`https://api.iamport.kr/certifications/${impUid}`, {
                headers: {
                    Authorization: getToken,
                },
            });
            const result = getCertification.data.response;
            return { status: 200, resultCode: 1, data: { result } };
        } catch (err) {
            console.log(err);
            return { status: 402, resultCode: 6042, data: null };
        }
    }

    async getCorpState(body: BaroBillReqDto): Promise<any> {
        Logger.log(`API - Get Corporation State`);
        const barobill = require('../../modules/barobill');
        const { corNum } = body;
        let data = null;
        if (corNum.length != 10) {
            return { resultCode: 6051, data: data };
        }
        const client = await barobill.createClient('https://ws.baroservice.com:8000/CORPSTATE.asmx?WSDL');
        return new Promise((resolve, reject) => {
            client.GetCorpState(
                {
                    CERTKEY: process.env.BAROBILL_CERT_KEY,
                    CorpNum: '4928701193',
                    CheckCorpNum: corNum,
                },
                (err, result) => {
                    if (result) {
                        let taxType = result.GetCorpStateResult.TaxType;
                        let state = result.GetCorpStateResult.State;
                        data = {
                            taxType,
                            state,
                        };
                        resolve(data);
                    } else {
                        reject(err);
                    }
                },
            );
        }).then((res) => {
            return { resultCode: 1, data: data };
        });
    }

    async checkAccountInfo(body: PopbillReqDto): Promise<any> {
        Logger.log(`API - Check Account Info`);
        const popbill = require('popbill');
        popbill.config({
            LinkID: 'NOUTECOMPANY',
            SecretKey: 'GtxNHprG4JZfiCYQHxYOzK7VJ7TIA/JV+3feCKyOx0I=',
            IsTest: false,
            IPRestrictOnOff: true,
            UseLocalTimeYN: true,
            UseStaticIP: false,
            defaultErrorHandler: function (Error) {
                console.log('Error Occur : [' + Error.code + '] ' + Error.message);
            },
        });
        const accountCheckService = popbill.AccountCheckService();
        try {
            let data = null;
            let testCorpNum = '4928701193';
            const { bankCode, accountNumber } = body;
            if (accountNumber.length < 8 || accountNumber.length > 14) {
                return { status: 201, resultCode: 6061, data: null };
            }
            return new Promise((resolve, reject) => {
                accountCheckService.checkAccountInfo(
                    testCorpNum,
                    bankCode,
                    accountNumber,
                    function (returnObj) {
                        data = {
                            result: returnObj,
                        };
                        resolve(data);
                    },
                    function (Error) {
                        data = {
                            code: Error.code,
                            message: Error.message,
                        };
                        reject(Error);
                    },
                );
            }).then((res) => {
                return { status: 200, resultCode: 1, data: data };
            });
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6062, data: null };
        }
    }

    async confirmPopbillId(req, body: confirmPopbillAccountReqDto) {
        Logger.log(`API - Confirm Popbill ID`);
        const popbill = require('popbill');
        popbill.config({
            LinkID: 'NOUTECOMPANY',
            SecretKey: 'GtxNHprG4JZfiCYQHxYOzK7VJ7TIA/JV+3feCKyOx0I=',
            IsTest: false,
            IPRestrictOnOff: true,
            UseLocalTimeYN: true,
            UseStaticIP: false,
            defaultErrorHandler: function (Error) {
                console.log('Error Occur : [' + Error.code + '] ' + Error.message);
            },
        });
        const accountCheckService = popbill.AccountCheckService();
        try {
            const { popbillId } = body;
            const sellerId = req.seller.sellerId;
            const seller = await this.sellerRepository.getSeller(sellerId);
            const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
            const sellerPopbillAccount = await this.sellerPopbillAccountRepository.getSellerPopbillAccount(
                sellerId,
            );
            let data = null;
            return new Promise((resolve, reject) => {
                accountCheckService.checkID(
                    popbillId,
                    function (result) {
                        data = {
                            result: result,
                        };
                        resolve(data);
                        sellerPopbillAccount.popbillId = popbillId;
                        sellerPopbillAccount.representativeName = sellerInfo.name;
                        sellerPopbillAccount.managerName = sellerInfo.name;
                        this.sellerPopbillAccountRepository.save(sellerPopbillAccount);
                    },
                    function (Error) {
                        data = {
                            result: Error,
                        };
                        reject(Error);
                    },
                );
            }).then(async (res) => {
                let popbillAccount = await this.sellerPopbillAccountRepository.create();
                popbillAccount.popbillId = popbillId;
                popbillAccount.seller = seller;
                await this.sellerPopbillAccountRepository.save(popbillAccount);
                return { status: 200, resultCode: 1, data: data };
            });
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6072, data: null };
        }
    }

    async addBusinessInfo(req, body: AddBusinessInfoReqDto) {
        Logger.log(`API - Add Seller Business Info`);
        const popbill = require('popbill');
        popbill.config({
            LinkID: 'NOUTECOMPANY',
            SecretKey: 'GtxNHprG4JZfiCYQHxYOzK7VJ7TIA/JV+3feCKyOx0I=',
            IsTest: false,
            IPRestrictOnOff: true,
            UseLocalTimeYN: true,
            UseStaticIP: false,
            defaultErrorHandler: function (Error) {
                console.log('Error Occur : [' + Error.code + '] ' + Error.message);
            },
        });
        const accountCheckService = popbill.AccountCheckService();
        const sellerId = req.seller.sellerId;
        const seller = await this.sellerRepository.getSeller(sellerId);
        const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);
        const sellerPopbillAccount = await this.sellerPopbillAccountRepository.getSellerPopbillAccount(
            sellerId,
        );
        let data = null;
        let dencryptPhone = await this.sellerRepository.dencryptPhone(seller.phone);
        const { popbillId, popbillPassword, address, businessType, businessItem, businessName } = body;
        const joinInfo = {
            ID: popbillId,
            Password: popbillPassword,
            LinkID: accountCheckService._config.LinkID,
            CorpNum: sellerInfo.businessNumber,
            CEOName: sellerInfo.name,
            CorpName: businessName,
            Addr: address,
            BizType: businessType,
            BizClass: businessItem,
            ContactName: sellerInfo.name,
            ContactEmail: seller.email,
            ContactTEL: dencryptPhone,
        };
        const checkId = await this.checkID(req, body);
        if (checkId.data.result.code === 1) {
            return { status: 201, resultCode: 6081, data: null };
        }
        try {
            return new Promise((resolve, reject) => {
                accountCheckService.joinMember(
                    joinInfo,
                    function (result) {
                        data = {
                            result: result,
                        };
                        resolve(data);
                        sellerPopbillAccount.popbillId = popbillId;
                        sellerPopbillAccount.popbillPassword = popbillPassword;
                        sellerPopbillAccount.businessName = businessName;
                        sellerPopbillAccount.address = address;
                        sellerPopbillAccount.businessType = businessType;
                        sellerPopbillAccount.businessItem = businessItem;
                        sellerInfo.popbillChecked = true;
                        this.sellerInfoRepository.save(sellerInfo);
                        this.sellerPopbillAccountRepository.save(sellerPopbillAccount);
                    },
                    function (Error) {
                        data = {
                            result: Error,
                        };
                        reject(Error);
                    },
                );
            }).then((res) => {
                return { resultCode: 1, data: data };
            });
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6082, data: null };
        }
    }

    async checkIsPopbillMember(body: any) {
        const popbill = require('popbill');
        popbill.config({
            LinkID: 'NOUTECOMPANY',
            SecretKey: 'GtxNHprG4JZfiCYQHxYOzK7VJ7TIA/JV+3feCKyOx0I=',
            IsTest: false,
            IPRestrictOnOff: true,
            UseLocalTimeYN: true,
            UseStaticIP: false,
            defaultErrorHandler: function (Error) {
                console.log('Error Occur : [' + Error.code + '] ' + Error.message);
            },
        });
        try {
            const accountCheckService = popbill.AccountCheckService();
            let data = null;
            let { corpNum } = body;
            return new Promise((resolve, reject) => {
                accountCheckService.checkIsMember(
                    corpNum,
                    function (result) {
                        data = {
                            result: result,
                        };
                        resolve(data);
                    },
                    function (Error) {
                        data = {
                            result: Error,
                        };
                        reject(Error);
                    },
                );
            }).then((res) => {
                return { resultCode: 1, data: data };
            });
        } catch (err) {
            console.log(err);
            return { resultCode: -1, data: null };
        }
    }

    async checkPopbillMember(body: any) {
        const popbill = require('popbill');
        popbill.config({
            LinkID: 'NOUTECOMPANY',
            SecretKey: 'GtxNHprG4JZfiCYQHxYOzK7VJ7TIA/JV+3feCKyOx0I=',
            IsTest: false,
            IPRestrictOnOff: true,
            UseLocalTimeYN: true,
            UseStaticIP: false,
            defaultErrorHandler: function (Error) {
                console.log('Error Occur : [' + Error.code + '] ' + Error.message);
            },
        });
        try {
            const accountCheckService = popbill.AccountCheckService();
            let data = null;
            let corpNum = body;
            return new Promise((resolve, reject) => {
                accountCheckService.checkIsMember(
                    corpNum,
                    function (result) {
                        data = {
                            result: result,
                        };
                        resolve(data);
                    },
                    function (Error) {
                        data = {
                            result: Error,
                        };
                        reject(Error);
                    },
                );
            }).then((res) => {
                return { resultCode: 1, data: data };
            });
        } catch (err) {
            console.log(err);
            return { resultCode: -1, data: null };
        }
    }

    async checkID(req: any, body: any) {
        const popbill = require('popbill');
        popbill.config({
            LinkID: 'NOUTECOMPANY',
            SecretKey: 'GtxNHprG4JZfiCYQHxYOzK7VJ7TIA/JV+3feCKyOx0I=',
            IsTest: false,
            IPRestrictOnOff: true,
            UseLocalTimeYN: true,
            UseStaticIP: false,
            defaultErrorHandler: function (Error) {
                console.log('Error Occur : [' + Error.code + '] ' + Error.message);
            },
        });
        try {
            const accountCheckService = popbill.AccountCheckService();
            const { popbillId } = body;
            let data = null;
            return new Promise((resolve, reject) => {
                accountCheckService.checkID(
                    popbillId,
                    function (result) {
                        data = {
                            result: result,
                        };
                        resolve(data);
                    },
                    function (Error) {
                        data = {
                            result: Error,
                        };
                        reject(Error);
                    },
                );
            }).then((res) => {
                return { resultCode: 1, data: data };
            });
        } catch (err) {
            console.log(err);
            return { resultCode: -1, data: null };
        }
    }

    async getCorpInfo(req: any, body: any) {
        const popbill = require('popbill');
        popbill.config({
            LinkID: 'NOUTECOMPANY',
            SecretKey: 'GtxNHprG4JZfiCYQHxYOzK7VJ7TIA/JV+3feCKyOx0I=',
            IsTest: false,
            IPRestrictOnOff: true,
            UseLocalTimeYN: true,
            UseStaticIP: false,
            defaultErrorHandler: function (Error) {
                console.log('Error Occur : [' + Error.code + '] ' + Error.message);
            },
        });
        try {
            const accountCheckService = popbill.AccountCheckService();
            let data = null;
            const { corpNum } = body;
            return new Promise((resolve, reject) => {
                accountCheckService.getCorpInfo(
                    corpNum,
                    function (result) {
                        data = {
                            result: result,
                        };
                        resolve(data);
                    },
                    function (Error) {
                        data = {
                            result: Error,
                        };
                        reject(Error);
                    },
                );
            }).then((res) => {
                return { resultCode: 1, data: data };
            });
        } catch (err) {
            console.log(err);
            return { resultCode: -1, data: null };
        }
    }

    // 서비스 로직

    async personalRegister(body: any): Promise<any> {
        const {
            email,
            password,
            phone,
            residentNumber,
            sellerType,
            businessOption,
            bankName,
            bankAccount,
            depositor,
            name,
        } = body;
        const query = await this.sellerRepository.query();
        query.select('MAX(s.id)', 'max');
        const maxSeller = await query.getRawOne();
        const hashedPassword = GenDigestPwd(password);
        const encryptPhoneNumber = await this.sellerRepository.encryptPhone(phone);
        const encryptAccountNumber = await this.sellerRepository.encryptBankAccount(bankAccount);
        const encryptedResidentNumber = await this.sellerRepository.encryptResidentNumber(residentNumber);
        const seller = await this.sellerRepository.create();
        seller.id = maxSeller.max + 1;
        seller.email = email;
        seller.password = hashedPassword;
        seller.phone = typeof encryptPhoneNumber === 'string' ? encryptPhoneNumber : '';
        await this.sellerRepository.save(seller);

        const sellerInfo = await this.sellerInfoRepository.create();
        sellerInfo.sellerType = sellerType;
        sellerInfo.businessOption = businessOption;
        sellerInfo.residentNumber =
            typeof encryptedResidentNumber === 'string' ? encryptedResidentNumber : '';

        let koreanCheck = true;
        let check = 0;

        if (parseInt(residentNumber.charAt(6)) > 4 && parseInt(residentNumber.charAt(6)) < 9) {
            koreanCheck = false;
            return { resultCode: 6004, data: null };
        }

        for (let i = 0; i < 12; i++) {
            check += ((i % 8) + 2) * parseInt(residentNumber.charAt(i));
        }

        check = 11 - (check % 11);
        check %= 10;
        let resNum = Number(residentNumber.charAt(12));

        if (check !== resNum) {
            return { resultCode: 6005, data: null };
        }

        const sellerPopbillAccount = await this.sellerPopbillAccountRepository.create();
        sellerPopbillAccount.representativeName = null;
        sellerPopbillAccount.popbillId = null;
        sellerPopbillAccount.seller = seller;
        sellerInfo.name = name;
        sellerInfo.bankName = bankName;
        sellerInfo.bankAccount = typeof encryptAccountNumber === 'string' ? encryptAccountNumber : '';
        sellerInfo.depositor = depositor;
        sellerInfo.seller = seller;

        await this.sellerInfoRepository.save(sellerInfo);
        await this.sellerPopbillAccountRepository.save(sellerPopbillAccount);

        const temp = await this.temporaryProductRepository.create();
        temp.id = seller.id;
        temp.seller = seller;
        await this.temporaryProductRepository.save(temp);
    }

    async businessRegister(body: any): Promise<any> {
        const {
            email,
            password,
            phone,
            sellerType,
            businessOption,
            bankName,
            bankAccount,
            depositor,
            name,
            representativeName,
            businessName,
            businessNumber,
        } = body;
        const query = await this.sellerRepository.query();
        query.select('MAX(s.id)', 'max');
        const maxSeller = await query.getRawOne();
        const hashedPassword = GenDigestPwd(password);
        const encryptPhoneNumber = await this.sellerRepository.encryptPhone(phone);
        const encryptAccountNumber = await this.sellerRepository.encryptBankAccount(bankAccount);
        const seller = await this.sellerRepository.create();
        seller.id = maxSeller.max + 1;
        seller.email = email;
        seller.password = hashedPassword;
        seller.phone = typeof encryptPhoneNumber === 'string' ? encryptPhoneNumber : '';
        await this.sellerRepository.save(seller);

        const sellerInfo = await this.sellerInfoRepository.create();
        sellerInfo.sellerType = sellerType;
        sellerInfo.businessOption = businessOption;
        sellerInfo.residentNumber = null;

        const sellerPopbillAccount = await this.sellerPopbillAccountRepository.create();
        sellerPopbillAccount.popbillId = null;
        sellerPopbillAccount.managerName = name;
        sellerPopbillAccount.representativeName = representativeName;
        sellerPopbillAccount.businessName = businessName;
        sellerPopbillAccount.seller = seller;
        sellerInfo.name = sellerPopbillAccount.managerName;
        sellerInfo.businessNumber = businessNumber;

        let popbillCheck = await this.checkPopbillMember(businessNumber);

        if (popbillCheck.data.result.code == 1) {
            sellerInfo.popbillChecked = true;
        } else {
            sellerInfo.popbillChecked = false;
        }

        sellerInfo.bankName = bankName;
        sellerInfo.bankAccount = typeof encryptAccountNumber === 'string' ? encryptAccountNumber : '';
        sellerInfo.depositor = depositor;
        sellerInfo.seller = seller;

        await this.sellerInfoRepository.save(sellerInfo);
        await this.sellerPopbillAccountRepository.save(sellerPopbillAccount);

        const temp = await this.temporaryProductRepository.create();
        temp.id = seller.id;
        temp.seller = seller;
        await this.temporaryProductRepository.save(temp);
    }

    async englishRegister(body: any): Promise<any> {
        const { email, password, name, countryCode, phone, ledgerType, ledgerEmail, residentNumber } = body;
        const hashedPassword = GenDigestPwd(password);
        const query = await this.sellerRepository.query();
        query.select('MAX(s.id)', 'max');
        const maxSeller = await query.getRawOne();
        let rawPhone = null;
        let encryptPhone = null;

        const seller = await this.sellerRepository.create();
        seller.id = maxSeller.max + 1;
        seller.email = email;
        seller.password = hashedPassword;
        seller.registType = false;

        let rawCountryData = fs.readFileSync(__dirname + '/../../' + 'country.json');
        const countryData = JSON.parse(rawCountryData.toString());
        let countryNum = null;

        for (let i = 0; i < countryData.length; i++) {
            if (countryCode === countryData[i].country_no) {
                seller.nationality = countryData[i].country_name;
                countryNum = countryData[i].country_no;
            }
        }

        rawPhone = countryNum + ' ' + phone;
        encryptPhone = await this.sellerRepository.encryptPhone(rawPhone);
        seller.phone = typeof encryptPhone === 'string' ? encryptPhone : '';
        await this.sellerRepository.save(seller);

        const sellerInfo = await this.sellerInfoRepository.create();
        sellerInfo.name = name;
        sellerInfo.ledgerType = ledgerType;
        sellerInfo.ledgerEmail = ledgerEmail;
        sellerInfo.residentNumber = residentNumber;
        sellerInfo.seller = seller;
        await this.sellerInfoRepository.save(sellerInfo);

        const sellerPopbillAccount = await this.sellerPopbillAccountRepository.create();
        sellerPopbillAccount.seller = seller;
        await this.sellerPopbillAccountRepository.save(sellerPopbillAccount);

        const temp = await this.temporaryProductRepository.create();
        temp.id = seller.id;
        temp.seller = seller;
        await this.temporaryProductRepository.save(temp);
    }

    async addSellerInfo(files: File[], body: any): Promise<any> {
        const { sellerId, brandName, englishBrandName, brandStory, englishBrandStory } = body;
        const seller = await this.sellerRepository.getSeller(sellerId);
        const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);

        if (sellerInfo.sellerType === SellerType.underage) {
            const sellerMinor = await this.sellerMinorFileRepository.create();
            sellerMinor.certificateOriginalName = files['legalRepresentCertificate'][0].key;
            sellerMinor.certificatePath = cloudfrontPath(files['legalRepresentCertificate'][0].key);
            sellerMinor.legalRepresentOriginalName = files['legalRepresent'][0].key;
            sellerMinor.legalRepresentPath = cloudfrontPath(files['legalRepresent'][0].key);
            sellerMinor.familyOriginalName = files['family'][0].key;
            sellerMinor.familyPath = cloudfrontPath(files['family'][0].key);
            sellerMinor.seller = seller;
            await this.sellerMinorFileRepository.save(sellerMinor);
        } else if (sellerInfo.sellerType == SellerType.corporate) {
            const sellerFile = await this.sellerFileRepository.create();
            sellerFile.seller = seller;
            await this.sellerFileRepository.save(sellerFile);
        }

        seller.status = SellerStatus.registered;
        await this.sellerRepository.save(seller);

        sellerInfo.brandImage = cloudfrontPath(files['profile'][0].key);
        sellerInfo.brandName = brandName;
        sellerInfo.englishBrandName = englishBrandName;
        sellerInfo.brandStory = brandStory;
        sellerInfo.englishBrandStory = englishBrandStory;
        await this.sellerInfoRepository.save(sellerInfo);
    }

    async addEnglishSellerInfo(files: File[], body: any): Promise<any> {
        const { sellerId, englishBrandName, englishBrandStory } = body;
        const seller = await this.sellerRepository.getSeller(sellerId);
        const sellerInfo = await this.sellerInfoRepository.getSellerInfo(sellerId);

        seller.status = SellerStatus.registered;
        await this.sellerRepository.save(seller);

        sellerInfo.brandImage = cloudfrontPath(files['profile'][0].key);
        sellerInfo.brandName = englishBrandName;
        sellerInfo.englishBrandName = englishBrandName;
        sellerInfo.brandStory = englishBrandStory;
        sellerInfo.englishBrandStory = englishBrandStory;
        await this.sellerInfoRepository.save(sellerInfo);
    }
}
