import { SellerInfo } from 'src/entity/SellerInfo.entity';
import { Seller } from 'src/entity/Seller.entity';
import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SellerSetting } from 'src/entity/SellerSettings.entity';
import { SellerFile } from 'src/entity/SellerFiles.entity';
import { SellerMinorFile } from 'src/entity/SellerMinorFile.entity';
import { IsObject, ValidateNested } from 'class-validator';

export class RegisterSeller extends OmitType(Seller, [
    'id',
    'enable',
    'createdAt',
    'updatedAt',
    'sellerInfo',
    'sellerSetting',
    'sellerFile',
    'sellerMinor',
    'ledger',
    'qna',
    'notRead',
    'englishNotRead',
    'sellerGroup',
    'noticeComment',
    'noticeCommentReply',
    'englishNoticeComment',
    'englishNoticeCommentReply',
    'product',
    'supportComment',
]) {}

export class RegisterSellerInfo extends OmitType(SellerInfo, [
    'feeRatio',
    'seller',
    'createdAt',
    'updatedAt',
]) {}

export class RegisterSellerSetting extends OmitType(SellerSetting, ['seller', 'updatedAt']) {}

export class RegisterSellerFile extends OmitType(SellerFile, ['id', 'seller', 'createdAt', 'updatedAt']) {}

export class RegisterSellerMinorFile extends OmitType(SellerMinorFile, [
    'id',
    'seller',
    'createdAt',
    'updatedAt',
]) {}

export class RegisterSellerResDto {
    @IsObject()
    @ValidateNested()
    @Type(() => RegisterSeller)
    seller: RegisterSeller;

    @Type(() => RegisterSellerInfo)
    sellerInfo: RegisterSellerInfo;

    @Type(() => RegisterSellerSetting)
    sellerSetting: RegisterSellerSetting;

    @Type(() => RegisterSellerFile)
    sellerFile: RegisterSellerFile;

    @Type(() => RegisterSellerMinorFile)
    sellerMinorFile: RegisterSellerMinorFile;
}
