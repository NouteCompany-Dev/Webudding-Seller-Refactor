import { Seller } from 'src/entity/Seller.entity';
import { PickType } from '@nestjs/swagger';

export class PostResetPasswordReqDto extends PickType(Seller, ['id', 'password']) {}
