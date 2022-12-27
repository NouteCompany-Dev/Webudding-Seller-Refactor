import { Seller } from 'src/entity/Seller.entity';
import { PickType } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class PostValidateEmailReqDto extends PickType(Seller, ['email']) {}
