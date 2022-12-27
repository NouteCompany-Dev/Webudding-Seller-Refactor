import { Seller } from 'src/entity/Seller.entity';
import { PickType } from '@nestjs/swagger';

export class PostFindPasswordReqDto extends PickType(Seller, ['email', 'phone']) {}
