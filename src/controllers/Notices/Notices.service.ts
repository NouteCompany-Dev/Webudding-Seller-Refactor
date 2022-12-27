import { Injectable } from '@nestjs/common';
import { cloudfrontPath } from 'src/modules/cloudfront';
import { SellerNoticeRepository } from 'src/repository/sellerNotice.repository';
import { SellerNoticeImageRepository } from 'src/repository/sellerNoticeImage.repository';
import { CreateNoticeReqDto } from './dto/req/CreateNoticeReq.dto';
import { NoticeListReqDto } from './dto/req/NoticesList.req.dto';

@Injectable()
export class NoticesService {
    constructor(
        private sellerNoticeRepository: SellerNoticeRepository,
        private sellerNoticeImageRepository: SellerNoticeImageRepository,
    ) {}

    async create(files: File[], req: any, body: CreateNoticeReqDto): Promise<any> {
        try {
            const { title, content } = body;
            const notice = await this.sellerNoticeRepository.create();
            notice.title = title;
            notice.content = content;
            await this.sellerNoticeRepository.save(notice);
            if (files['noticeImage']) {
                files['noticeImage'].forEach(async (o, i) => {
                    let sellerNoticeImage = await this.sellerNoticeImageRepository.create();
                    sellerNoticeImage.originalImageName = o.key;
                    sellerNoticeImage.imagePath = cloudfrontPath(o.key);
                    sellerNoticeImage.notice = notice;
                    await this.sellerNoticeImageRepository.save(sellerNoticeImage);
                });
            }
        } catch (err) {
            console.log(err);
            return { resultCode: -1, data: null };
        }
    }

    async list(req: any, body: NoticeListReqDto): Promise<any> {
        try {
            const [row, count] = await this.sellerNoticeRepository.getList(body);
            let data = {
                noticeData: row,
                count: count,
            };
            return { status: 200, resultCode: 1, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6801, data: null };
        }
    }

    async detail(req: any, id: number): Promise<any> {
        try {
            let status = 0;
            let resultCode = 0;
            let data = null;
            const notice = await this.sellerNoticeRepository.getOne(id);
            const noticeImage = await this.sellerNoticeImageRepository.getOne(id);
            if (!notice) {
                status = 201;
                resultCode = 6811;
            } else {
                data = {
                    notice: notice,
                    noticeImage: noticeImage,
                };
                status = 200;
                resultCode = 1;
            }
            return { status: status, resultCode: resultCode, data: data };
        } catch (err) {
            console.log(err);
            return { status: 401, resultCode: 6812, data: null };
        }
    }
}
