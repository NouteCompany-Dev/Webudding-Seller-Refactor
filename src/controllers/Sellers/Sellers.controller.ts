import {
    Body,
    Controller,
    Get,
    Logger,
    Patch,
    Req,
    Res,
    UploadedFiles,
    UseInterceptors,
    Post,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ResultFailDto, ResultSuccessDto } from 'src/common/dto/Result.dto';
import { fileUpload } from 'src/middlewares/multer.middleware';
import { FindSellerEmailReqDto, FindSellerPasswordReqDto } from './dto/req/FindSellerInfoReq.dto';
import {
    UpdateSellerReqDto,
    UpdateBrandReqDto,
    UpdateLedgerReqDto,
    UpdateEnglishSellerReqDto,
    UpdateEnglishLedgerReqDto,
} from './dto/req/UpdateSellersReq.dto';
import { UpdateToCorpReqDto, UpdateToPersonalReqDto } from './dto/req/UpdateSellerTypeReq.dto';
import {
    CheckPhoneResDto,
    FindSellerEmailSuccessDto,
    FindSellerPasswordSuccessDto,
    FindSellerEmailFailDto,
    CheckSellerInfoResDto,
    FindSellerPasswordFailDto,
} from './dto/res/FindSellerInfoRes.dto';
import {
    CheckEnglishEmailVerifyFailDto,
    CheckEnglishPasswordFailDto,
    CheckPasswordFailDto,
    CheckSellerResDto,
    InfoBrandFailDto,
    InfoEnglishSellerFailDto,
    InfoEnglishSellerResDto,
    InfoLedgerFailDto,
    InfoSellerFailDto,
    InfoSellerResDto,
    InfoSellerSuccessDto,
    SellerCheckResDto,
    EnglishSellerInfoFailDto,
} from './dto/res/InfoSellerRes.dto';
import {
    CheckResidentNumberResDto,
    UpdateCorpTypeFailDto,
    UpdateSellerTypeFailDto,
    UploadSellerFileResDto,
} from './dto/res/UpdateSellerTypeRes.dto';
import { SellersService } from './Sellers.service';

@ApiTags('셀러')
@Controller('sellers')
export class SellersController {
    constructor(private sellersService: SellersService) {}

    @Get('info')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '국내 셀러 정보 조회' })
    @ApiResponse({ status: 200, type: InfoSellerSuccessDto, description: '국내 셀러 정보 조회 성공' })
    @ApiResponse({ status: 201, type: InfoSellerResDto, description: '존재하지 않는 국내 셀러' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청값 에러' })
    @ApiResponse({ status: 401, type: InfoSellerFailDto, description: '국내 셀러 정보 조회 실패' })
    async SellerInfo(@Req() req: Request, @Res() res: Response) {
        Logger.log('API - Seller Info');
        try {
            const result = await this.sellersService.info(req);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Get('en/info')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '해외 셀러 정보 조회' })
    @ApiResponse({ status: 200, type: InfoSellerSuccessDto, description: '해외 셀러 정보 조회 성공' })
    @ApiResponse({ status: 201, type: InfoEnglishSellerResDto, description: '존재하지 않는 해외 셀러' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청값 에러' })
    @ApiResponse({ status: 401, type: EnglishSellerInfoFailDto, description: '해외 셀러 정보 조회 실패' })
    async SellerEnInfo(@Req() req: Request, @Res() res: Response) {
        Logger.log('API - English Seller Info');
        try {
            const result = await this.sellersService.enInfo(req);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Patch('admin')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '국내 셀러 어드민 정보 수정' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '국내 셀러 어드민 정보 수정 성공' })
    @ApiResponse({ status: 201, type: CheckPasswordFailDto, description: '비밀번호 불일치' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: InfoSellerFailDto, description: '국내 셀러 어드민 정보 수정 실패' })
    async brandUpdate(@Req() req: Request, @Body() body: UpdateSellerReqDto, @Res() res: Response) {
        try {
            Logger.log('API - Seller Admin Info Update');
            const result = await this.sellersService.adminUpdate(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Patch('en/admin')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '해외 셀러 어드민 정보 수정' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '해외 셀러 어드민 정보 수정 성공' })
    @ApiResponse({ status: 201, type: CheckEnglishPasswordFailDto, description: '비밀번호 불일치' })
    @ApiResponse({
        status: 202,
        type: CheckEnglishEmailVerifyFailDto,
        description: '잘못된 이메일 인증 코드',
    })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({
        status: 401,
        type: InfoEnglishSellerFailDto,
        description: '해외 셀러 어드민 정보 수정 실패',
    })
    async enBrandUpdate(
        @Req() req: Request,
        @Body() body: UpdateEnglishSellerReqDto,
        @Res() res: Response,
    ) {
        try {
            Logger.log('API - English Seller Admin Info Update');
            const result = await this.sellersService.enSellerUpdate(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Patch('brand')
    @ApiBearerAuth('seller-auth')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'profile' }], fileUpload))
    @ApiOperation({ summary: '브랜드 정보 수정' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '브랜드 정보 수정 성공' })
    @ApiResponse({ status: 201, type: CheckSellerResDto, description: '존재하지 않는 셀러' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: InfoBrandFailDto, description: '브랜드 정보 수정 실패' })
    async sellerUpdate(
        @UploadedFiles() files: File[],
        @Req() req: Request,
        @Body() body: UpdateBrandReqDto,
        @Res() res: Response,
    ) {
        try {
            Logger.log('API - Seller Brand Info Update');
            console.log(files);
            const result = await this.sellersService.brandUpdate(files, req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Patch('ledger')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '정산 정보 수정' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '정산 정보 수정 성공' })
    @ApiResponse({ status: 201, type: SellerCheckResDto, description: '존재하지 않는 셀러' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: InfoLedgerFailDto, description: '정산 정보 수정 실패' })
    async ledgerUpdate(@Req() req: Request, @Body() body: UpdateLedgerReqDto, @Res() res: Response) {
        try {
            Logger.log('API - Seller Ledger Info Update');
            const result = await this.sellersService.ledgerUpdate(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Patch('en/ledger')
    @ApiBearerAuth('seller-auth')
    @ApiOperation({ summary: '해외 정산 정보 수정' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '정산 정보 수정 성공' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: InfoLedgerFailDto, description: '정산 정보 수정 실패' })
    async enLedgerUpdate(
        @Req() req: Request,
        @Body() body: UpdateEnglishLedgerReqDto,
        @Res() res: Response,
    ) {
        try {
            Logger.log('API - English Seller Ledger Info Update');
            const result = await this.sellersService.enLedgerUpdate(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('updateToCorp')
    @ApiOperation({ summary: '셀러 입점 형태 수정(개인 -> 사업자)' })
    @UseInterceptors(FileFieldsInterceptor([{ name: 'sellerFile' }], fileUpload))
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '셀러 입점 형태 수정 성공' })
    @ApiResponse({
        status: 201,
        type: UploadSellerFileResDto,
        description: '법인인감증명서 파일 업로드 필요',
    })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: UpdateSellerTypeFailDto, description: '셀러 입점 형태 수정 실패' })
    @ApiBearerAuth('seller-auth')
    async updateToCorp(
        @UploadedFiles() files: File[],
        @Req() req: Request,
        @Body() body: UpdateToCorpReqDto,
        @Res() res: Response,
    ) {
        try {
            Logger.log('API - Personal Seller Update To Corporation Type');
            const result = await this.sellersService.updateToCorp(files, req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('updateToPersonal')
    @ApiOperation({ summary: '셀러 입점 형태 수정(개인으로 변경)' })
    @ApiResponse({ status: 200, type: ResultSuccessDto, description: '셀러 입점 형태 수정 성공' })
    @ApiResponse({ status: 201, type: CheckResidentNumberResDto, description: '주민등록번호 입력 필요' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: UpdateCorpTypeFailDto, description: '셀러 입점 형태 수정 실패' })
    @ApiBearerAuth('seller-auth')
    async updateToPersonal(
        @Req() req: Request,
        @Body() body: UpdateToPersonalReqDto,
        @Res() res: Response,
    ) {
        try {
            Logger.log('API - Corporation Seller Update To Personal Type');
            const result = await this.sellersService.updateToPersonal(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('findEmail')
    @ApiOperation({ summary: '셀러 이메일 찾기' })
    @ApiResponse({ status: 200, type: FindSellerEmailSuccessDto, description: '셀러 이메일 찾기 성공' })
    @ApiResponse({ status: 201, type: CheckPhoneResDto, description: '다날 토큰 발급 실패' })
    @ApiResponse({ status: 202, type: CheckSellerResDto, description: '셀러 휴대폰 인증 실패' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: FindSellerEmailFailDto, description: '셀러 이메일 찾기 실패' })
    async findSellerEmail(@Req() req: Request, @Body() body: FindSellerEmailReqDto, @Res() res: Response) {
        try {
            const result = await this.sellersService.findEmail(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Post('findPassword')
    @ApiOperation({ summary: '셀러 비밀번호 찾기' })
    @ApiResponse({
        status: 200,
        type: FindSellerPasswordSuccessDto,
        description: '셀러 비밀번호 찾기 성공',
    })
    @ApiResponse({ status: 201, type: CheckSellerInfoResDto, description: '존재하지 않는 셀러 정보' })
    @ApiResponse({ status: 400, type: ResultFailDto, description: '요청 값 에러' })
    @ApiResponse({ status: 401, type: FindSellerPasswordFailDto, description: '셀러 비밀번호 찾기 실패' })
    async findSellerPassword(
        @Req() req: Request,
        @Body() body: FindSellerPasswordReqDto,
        @Res() res: Response,
    ) {
        try {
            const result = await this.sellersService.findPassword(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }

    @Get('groupSellers')
    async GroupSeller(@Req() req: Request) {
        try {
            const result = await this.sellersService.groupingSeller(req);
            return result;
        } catch (err) {
            return { data: null };
        }
    }

    @Post('check/resident')
    async checkResident(@Req() req: Request, @Body() body: any, @Res() res: Response) {
        try {
            const result = await this.sellersService.checkResident(req, body);
            res.status(200).json(result);
        } catch (err) {
            console.log(err);
            res.status(400).json({ resultCode: -1, data: null });
        }
    }
}
