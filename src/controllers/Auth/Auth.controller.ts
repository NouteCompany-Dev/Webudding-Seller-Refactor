import { aesEncrypt, aesDencrypt, rsaDencrypt, rsaEncrypt, GenDigestPwd } from 'src/lib/crypto';
import { CorpStateResDto } from './dto/res/GetCorpStateRes.dto';
import { GetDanalTokenFailDto, GetDanalCertificationFailDto } from './dto/res/PhoneCertificationRes.dto';
import {
    BrandNameCheckFailResDto,
    BrandNameCheckResDto,
    EnglishBrandNameCheckFailResDto,
    EnglishBrandNameCheckResDto,
} from './dto/res/CheckBrandNameRes.dto';
import { fileUpload } from './../../middlewares/multer.middleware';
import {
    AddInfoEnglishSellerReqDto,
    AddInfoSellerReqDto,
    RegisterEnglishSellerReqDto,
    RegisterSellerReqDto,
} from './dto/req/RegisterSellerReq.dto';
import { Body, Controller, Logger, Post, Req, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './Auth.service';
import { LoginSellerReqDto } from './dto/req/LoginSellerReq.dto';
import {
    AddInfoErrorResDto,
    EmailErrorResDto,
    LoginSellerFailDto,
    LoginSellerSuccessDto,
    PasswordErrorResDto,
    RegisteredErrorResDto,
    RejectedErrorResDto,
    SellerErrorResDto,
} from './dto/res/LoginSellerRes.dto';
import { ResultFailDto, ResultSuccessDto } from 'src/common/dto/Result.dto';
import {
    EmailDuplicateResDto,
    RegistSellerFailDto,
    PhoneDuplicateResDto,
    AccountDuplicateResDto,
    EnglishEmailDuplicateResDto,
    EnglishPhoneDuplicateResDto,
    RegistEnglishSellerFailDto,
} from './dto/res/RegisterSellerRes.dto';
import { PhoneAuthSuccessDto } from './dto/res/PhoneAuthSuccess.dto';
import { BrandNameCheckReqDto, EnglishBrandNameCheckReqDto } from './dto/req/GetBrandNameReq.dto';
import { RenewTokenReqDto } from './dto/req/RenewTokenReq.dto';
import {
    RefreshTokenExpiredDto,
    RenewTokenFailDto,
    RenewTokenSuccessDto,
} from './dto/res/RenewTokenRes.dto';
import { EmailDuplicateReqDto } from './dto/req/GetEmailReq.dto';
import { EmailDuplicateDto, EmailDuplicateFailDto } from './dto/res/GetEmailRes.dto';
import { BaroBillReqDto, DanalReqDto, PopbillReqDto } from './dto/req/ThirdPartyReq.dto';
import { CorpStateSuccessDto, AccountCheckSuccessDto } from './dto/res/ThirdPartyRes.dto';
import {
    CheckIsPopbillMemberReqDto,
    confirmPopbillAccountReqDto,
} from './dto/req/ConfirmPopbillAccount.req.dto';
import { AddBusinessInfoReqDto } from './dto/req/AddBusinessInfo.req.dto';
import {
    AddInfoFailResDto,
    BrandNameDuplicateResDto,
    DuplicateEnglishBrandNameResDto,
    EnglishBrandNameDuplicateResDto,
} from './dto/res/AddInfoRes.dto';
import { CheckAccountResDto, GetAccountFailDto } from './dto/res/CheckAccountRes.dto';
import {
    AddBusinessInfoFailDto,
    AddBusinessInfoResDto,
    AddBusinessInfoSuccessDto,
    CheckIsPopbillMemberFailDto,
    CheckIsPopbillMemberResDto,
    CheckIsPopbillMemberSuccessDto,
    CheckPopbillMemberResDto,
    ConfirmPopbillAccountFailDto,
    ConfirmPopbillAccountSuccessDto,
} from './dto/res/CheckPopbillRes.dto';
import { SendVerificationCodeReqDto } from './dto/req/EnglishSellerRegist.req.dto';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: '국내 셀러 입점신청' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '입점신청 성공' })
    @ApiResponse({ status: 201, type: EmailDuplicateResDto, description: '이메일 중복' })
    @ApiResponse({ status: 202, type: PhoneDuplicateResDto, description: '휴대폰 번호 중복' })
    @ApiResponse({ status: 203, type: AccountDuplicateResDto, description: '계좌번호 중복' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: RegistSellerFailDto, description: '입점신청 실패' })
    async register(@Body() body: RegisterSellerReqDto, @Res() res: Response): Promise<void> {
        Logger.log('API - Seller Register');
        try {
            const result = await this.authService.register(body);
            res.status(200).json(result);
        } catch (err) {
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('en/register')
    @ApiOperation({ summary: '해외 셀러 입점신청' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '입점신청 성공' })
    @ApiResponse({ status: 202, type: EnglishEmailDuplicateResDto, description: '이메일 중복' })
    @ApiResponse({ status: 203, type: EnglishPhoneDuplicateResDto, description: '휴대폰 번호 중복' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: RegistEnglishSellerFailDto, description: '입점신청 실패' })
    async enRegister(@Body() body: RegisterEnglishSellerReqDto, @Res() res: Response): Promise<void> {
        Logger.log('API - English Seller Register');
        try {
            const result = await this.authService.enRegister(body);
            res.status(200).json(result);
        } catch (err) {
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('send/email')
    @ApiOperation({ summary: '해외 셀러 이메일 검증 코드' })
    async sendEmail(@Body() body: SendVerificationCodeReqDto, @Res() res: Response) {
        Logger.log('API - English Seller Send Verify Email');
        try {
            const result = await this.authService.verifyEmail(body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('login')
    @ApiOperation({ summary: '로그인' })
    @ApiResponse({ status: 200, type: LoginSellerSuccessDto, description: '로그인 성공' })
    @ApiResponse({ status: 201, type: EmailErrorResDto, description: '존재하지 않는 이메일' })
    @ApiResponse({ status: 202, type: PasswordErrorResDto, description: '비밀번호 불일치' })
    @ApiResponse({ status: 203, type: SellerErrorResDto, description: '탈퇴한 회원' })
    @ApiResponse({ status: 204, type: AddInfoErrorResDto, description: '추가 정보 입력 필요' })
    @ApiResponse({ status: 205, type: RegisteredErrorResDto, description: '승인 대기' })
    @ApiResponse({ status: 206, type: RejectedErrorResDto, description: '승인 대기' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: LoginSellerFailDto, description: '로그인 실패' })
    async login(@Body() body: LoginSellerReqDto, @Res() res: Response) {
        Logger.log(`API - Seller Login ${body.email}`);
        try {
            const result = await this.authService.login(body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('info/update')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                {
                    name: 'profile', //브랜드 이미지
                },
                {
                    name: 'backProfile', //브랜드 배경 이미지
                },
                {
                    name: 'certificate', //법인인감증명서
                },
                {
                    name: 'legalRepresent', //법정대리인
                },
                {
                    name: 'family', //가족관계증명서
                },
                {
                    name: 'legalRepresentCertificate', //법정대리인 인감 증명서
                },
            ],
            fileUpload,
        ),
    )
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: '입점신청 추가 정보 입력' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '입점신청 추가 정보 입력 성공' })
    @ApiResponse({ status: 201, type: BrandNameDuplicateResDto, description: '브랜드명 중복' })
    @ApiResponse({ status: 202, type: EnglishBrandNameDuplicateResDto, description: '영문 브랜드명 중복' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: AddInfoFailResDto, description: '추가 정보 입력 실패' })
    async addInfo(@UploadedFiles() files: File[], @Body() body: AddInfoSellerReqDto, @Res() res: Response) {
        Logger.log('API - Seller Add Info');
        try {
            const result = await this.authService.addInfo(files, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('en/info/update')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                {
                    name: 'profile', //브랜드 이미지
                },
            ],
            fileUpload,
        ),
    )
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: '해외 작가 입점신청 추가 정보 입력' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '해외 입점신청 추가 정보 입력 성공' })
    @ApiResponse({ status: 201, type: DuplicateEnglishBrandNameResDto, description: '영문 브랜드명 중복' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: AddInfoFailResDto, description: '추가 정보 입력 실패' })
    async enAddInfo(
        @UploadedFiles() files: File[],
        @Body() body: AddInfoEnglishSellerReqDto,
        @Res() res: Response,
    ) {
        Logger.log('API - English Seller Add Info');
        try {
            const result = await this.authService.enAddInfo(files, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    // @Post('phoneAuth')
    // @ApiOperation({ summary: '인증번호 전송' })
    // @ApiResponse({ status: 200, type: PhoneAuthSuccessDto, description: '인증번호 전송 성공' })
    // @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    // @ApiResponse({ status: 401, type: PhoneAuthFailDto, description: '인증번호 전송 실패' })
    // async phoneAuth(@Body() body: PhoneAuthReqDto, @Res() res: Response) {
    //     Logger.log('API - Phone Auth Submit');
    //     try {
    //         const result = await this.authService.phoneAuth(body);
    //         res.status(200).json(result);
    //     } catch (err) {
    //         console.log(err);
    //         res.status(400).json({ "resultCode": -1, "data": null });
    //     }
    // }

    @Post('brand/check')
    @ApiOperation({ summary: '브랜드명 중복 확인' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '브랜드 명 중복 없음' })
    @ApiResponse({ status: 201, type: BrandNameCheckResDto, description: '브랜드 명 중복' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: BrandNameCheckFailResDto, description: '로그인 실패' })
    async brandNameCheck(@Body() data: BrandNameCheckReqDto, @Res() res: Response) {
        Logger.log('API - Seller Brand Name Duplicate Check');
        try {
            const result = await this.authService.brandNameCheck(data);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }
    @Post('/en/brand/check')
    @ApiOperation({ summary: '영문 브랜드명 중복 확인' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '영문 브랜드 명 중복 없음' })
    @ApiResponse({ status: 201, type: EnglishBrandNameCheckResDto, description: '영문 브랜드 명 중복' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({
        status: 401,
        type: EnglishBrandNameCheckFailResDto,
        description: '영문 브랜드 명 중복 확인 에러',
    })
    async englishBrandNameCheck(@Body() data: EnglishBrandNameCheckReqDto, @Res() res: Response) {
        Logger.log('API - Seller English Brand Name Duplicate Check');
        try {
            const result = await this.authService.enBrandNameCheck(data);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('email/check')
    @ApiOperation({ summary: '이메일 중복 확인' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '이메일 중복 없음' })
    @ApiResponse({ status: 201, type: EmailDuplicateDto, description: '이메일 중복 있음' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: EmailDuplicateFailDto, description: '이메일 중복 확인 에러' })
    async emailCheck(@Body() data: EmailDuplicateReqDto, @Res() res: Response) {
        Logger.log('API - Seller Emial Duplicate Check');
        try {
            const result = await this.authService.emailCheck(data);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('renew/token')
    @ApiOperation({ summary: '토큰 갱신', description: '리프레쉬 토큰으로 accessToken 갱신' })
    @ApiResponse({ status: 200, type: RenewTokenSuccessDto, description: '토큰 갱신 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: RenewTokenFailDto, description: '토큰 갱신 실패' })
    @ApiResponse({ status: 403, type: RefreshTokenExpiredDto, description: '리프레쉬 토큰 만료' })
    async renewToken(@Body() body: RenewTokenReqDto, @Res() res: Response) {
        try {
            const result = await this.authService.renewToken(body);
            res.status(result.status).json(result.data);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('phone/certification')
    @ApiOperation({ summary: '휴대폰 번호 인증', description: '다날 휴대폰 번호 인증' })
    @ApiResponse({ status: 200, type: PhoneAuthSuccessDto, description: '휴대폰 번호 인증 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: GetDanalTokenFailDto, description: '다날 토큰 발급 에러' })
    @ApiResponse({ status: 402, type: GetDanalCertificationFailDto, description: '휴대폰 번호 인증 에러' })
    async danal(@Body() body: DanalReqDto, @Res() res: Response) {
        Logger.log('API - Seller Phone Certification');
        try {
            const getToken = await this.authService.getTokenDanal();
            const result = await this.authService.getCertificationsDanal(body, getToken);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: 1, data: null });
        }
    }

    @Post('business/certification')
    @ApiOperation({ summary: '사업자등록번호 인증', description: '바로빌 사업자등록번호 인증' })
    @ApiResponse({ status: 200, type: CorpStateSuccessDto, description: '사업자등록번호 인증 성공' })
    @ApiResponse({ status: 201, type: CorpStateResDto, description: '사업자등록번호 입력 길이 오류' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    async barobill(@Body() body: BaroBillReqDto, @Res() res: Response) {
        Logger.log('API - Seller Corporation State Certification');
        try {
            const result = await this.authService.getCorpState(body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('account/certification')
    @ApiOperation({ summary: '계좌번호 인증', description: '팝빌 계좌번호 인증' })
    @ApiResponse({ status: 200, type: AccountCheckSuccessDto, description: '계좌번호 인증 성공' })
    @ApiResponse({ status: 201, type: CheckAccountResDto, description: '계좌번호 입력 길이 오류' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: GetAccountFailDto, description: '계좌번호 인증 에러' })
    async popbill(@Body() body: PopbillReqDto, @Res() res: Response) {
        Logger.log('API - Seller Bank Account Certification');
        try {
            const result = await this.authService.checkAccountInfo(body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('confirm')
    @ApiBearerAuth('seller-auth')
    @ApiResponse({
        status: 200,
        type: ConfirmPopbillAccountSuccessDto,
        description: '사업자 팝빌 아이디 확인 성공',
    })
    @ApiResponse({
        status: 201,
        type: CheckPopbillMemberResDto,
        description: '팝빌에 가입하지 않은 사업자 셀러',
    })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청값 에러' })
    @ApiResponse({
        status: 401,
        type: ConfirmPopbillAccountFailDto,
        description: '사업자 팝빌 아이디 확인 실패',
    })
    @ApiOperation({ summary: '사업자 팝빌 아이디 확인' })
    async confirm(@Req() req: Request, @Body() body: confirmPopbillAccountReqDto, @Res() res: Response) {
        Logger.log('API - Confirm Seller Popbill Account');
        try {
            const result = await this.authService.confirmPopbillId(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('addInfo')
    @ApiBearerAuth('seller-auth')
    @ApiResponse({
        status: 200,
        type: AddBusinessInfoSuccessDto,
        description: '사업자 팝빌 추가 정보 입력 성공',
    })
    @ApiResponse({ status: 201, type: AddBusinessInfoResDto, description: '사업자 팝빌 아이디 중복' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청값 에러' })
    @ApiResponse({
        status: 401,
        type: AddBusinessInfoFailDto,
        description: '사업자 팝빌 추가 정보 입력 실패',
    })
    @ApiOperation({ summary: '사업자 팝빌 추가 정보 입력' })
    async addBusinessInfo(@Req() req: Request, @Body() body: AddBusinessInfoReqDto, @Res() res: Response) {
        Logger.log('API - Confirm Seller Popbill Account');
        try {
            const result = await this.authService.addBusinessInfo(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('check/popbill/member')
    @ApiResponse({
        status: 200,
        type: CheckIsPopbillMemberSuccessDto,
        description: '사업자 팝빌 가입 여부 확인 성공',
    })
    @ApiResponse({
        status: 201,
        type: CheckIsPopbillMemberResDto,
        description: '팝빌 아이디가 존재하지 않는 사업자 셀러',
    })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청값 에러' })
    @ApiResponse({
        status: 401,
        type: CheckIsPopbillMemberFailDto,
        description: '사업자 팝빌 가입 여부 확인 실패',
    })
    @ApiOperation({ summary: '사업자 팝빌 아이디 확인' })
    async checkIsPopbillMember(
        @Req() req: Request,
        @Body() body: CheckIsPopbillMemberReqDto,
        @Res() res: Response,
    ) {
        Logger.log('API - Check Seller Popbill Member');
        try {
            const result = await this.authService.checkIsPopbillMember(body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('popbill/info')
    @ApiBearerAuth('seller-auth')
    @ApiResponse({
        status: 200,
        type: CheckIsPopbillMemberSuccessDto,
        description: '사업자 팝빌 가입 여부 확인 성공',
    })
    @ApiResponse({
        status: 201,
        type: CheckIsPopbillMemberResDto,
        description: '팝빌 아이디가 존재하지 않는 사업자 셀러',
    })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청값 에러' })
    @ApiResponse({
        status: 401,
        type: CheckIsPopbillMemberFailDto,
        description: '사업자 팝빌 가입 여부 확인 실패',
    })
    @ApiOperation({ summary: '사업자 팝빌 정보 조회' })
    async getCorpInfo(@Req() req: Request, @Body() body: CheckIsPopbillMemberReqDto, @Res() res: Response) {
        Logger.log('API - Check Seller Popbill Info');
        try {
            const result = await this.authService.getCorpInfo(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('encrypt/phone')
    async encryptPhone(@Body() body: any, @Res() res: Response) {
        Logger.log('API - Encrypt Phone Number');
        try {
            const { phone } = body;
            const result = aesEncrypt(phone);
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    @Post('dencrypt/phone')
    async dencryptPhone(@Body() body: any, @Res() res: Response) {
        Logger.log('API - Dencrypt Phone Number');
        try {
            const { phone } = body;
            const result = aesDencrypt(phone);
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    @Post('encrypt/account')
    async encryptAccount(@Body() body: any, @Res() res: Response) {
        Logger.log('API - Encrypt Bank Account Number');
        try {
            const { bankAccount } = body;
            const result = aesEncrypt(bankAccount);
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    @Post('dencrypt/account')
    async dencryptAccount(@Body() body: any, @Res() res: Response) {
        Logger.log('API - Dencrypt Bank Account Number');
        try {
            const { bankAccount } = body;
            const result = aesDencrypt(bankAccount);
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    @Post('encrypt/resident')
    async encryptResident(@Body() body: any, @Res() res: Response) {
        Logger.log('API - Encrypt Resident Number');
        try {
            const { residentNumber } = body;
            const result = rsaEncrypt(residentNumber);
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    @Post('dencrypt/resident')
    async dencryptResident(@Body() body: any, @Res() res: Response) {
        Logger.log('API - Dencrypt Resident Number');
        try {
            const { residentNumber } = body;
            const result = rsaDencrypt(residentNumber);
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
        }
    }

    @Post('encrypt/password')
    async encryptPassword(@Body() body: any, @Res() res: Response) {
        Logger.log('API - Encrypt Password');
        try {
            const { password } = body;
            const result = GenDigestPwd(password);
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
        }
    }
}
