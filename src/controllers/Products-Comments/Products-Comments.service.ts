import { SellerQnaRepsitory } from './../../repository/sellerQna.repository';
import { Injectable } from '@nestjs/common';
import { CreateProductsCommentAnswerReqDto } from './dto/req/CreateProductCommentAnswer.req.dto';

@Injectable()
export class ProductsCommentsService {
    constructor(private readonly sellerQnaRepository: SellerQnaRepsitory) {}

    async createAnswer(body: CreateProductsCommentAnswerReqDto, id: number): Promise<any> {
        try {
            let data = null;
            const productComment = await this.sellerQnaRepository.getProductComment(id);
            const { answer } = body;
            productComment.answer = answer;
            await this.sellerQnaRepository.save(productComment);
            data = {
                answer: answer,
            };
            return { status: 200, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: -1, data: null };
        }
    }
}
