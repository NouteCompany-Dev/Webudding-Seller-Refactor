import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { OrderProduct } from 'src/entity/OrderProduct.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderProductRepository {
    constructor(
        @InjectRepository(OrderProduct)
        private orderProductRepository: Repository<OrderProduct>,
    ) {}

    async getOrderData(body: any): Promise<any> {
        return await this.orderProductRepository
            .createQueryBuilder('op')
            .where('op.productId = :body', { body: body })
            .getOne();
    }

    async getSaleListData(body: any): Promise<any> {
        const { sellerId, productId, startDate, endDate } = body;
        let endDateDay = endDate.toString();
        let end = endDateDay + ' 23:59:59';
        return await this.orderProductRepository
            .createQueryBuilder('op')
            .leftJoinAndSelect('op.order', 'opo')
            .leftJoinAndSelect('op.product', 'opp')
            .leftJoinAndSelect('opp.category', 'c')
            .andWhere('opp.sellerId = :sellerId', { sellerId: sellerId })
            .andWhere('opp.id = :id', { id: productId })
            .andWhere('op.orderStatus = "confirmed"')
            .andWhere('opo.paymentDate >= :startDate', { startDate: startDate })
            .andWhere('opo.paymentDate <= :endDate', { endDate: end })
            .getMany();
    }

    async getTotalSaleData(body: any): Promise<any> {
        const { sellerId, startDate, endDate } = body;
        let endDateDay = endDate.toString();
        let end = endDateDay + ' 23:59:59';
        return await this.orderProductRepository
            .createQueryBuilder('op')
            .leftJoinAndSelect('op.product', 'opp')
            .leftJoinAndSelect('op.order', 'opo')
            .where('opp.sellerId = :sellerId', { sellerId: sellerId })
            .andWhere('opo.paymentDate >= :startDate', { startDate: startDate })
            .andWhere('opo.paymentDate <= :endDate', { endDate: end })
            .andWhere('op.orderStatus = "confirmed"')
            .getMany();
    }

    async getSaleDataByParentCategory(body: any): Promise<any> {
        const { sellerId, categoryId, startDate, endDate } = body;
        let endDateDay = endDate.toString();
        let end = endDateDay + ' 23:59:59';
        return await this.orderProductRepository
            .createQueryBuilder('op')
            .leftJoinAndSelect('op.product', 'opp')
            .leftJoinAndSelect('op.order', 'opo')
            .leftJoinAndSelect('opp.category', 'c')
            .leftJoinAndSelect('c.parent', 'cp')
            .where('opp.sellerId = :sellerId', { sellerId: sellerId })
            .andWhere('cp.id = :categoryId', { categoryId: categoryId })
            .andWhere('opo.paymentDate >= :startDate', { startDate: startDate })
            .andWhere('opo.paymentDate <= :endDate', { endDate: end })
            .andWhere('op.orderStatus = "confirmed"')
            .getManyAndCount();
    }

    async getOrderProductData(body: any): Promise<any> {
        const { sellerId, startDate, endDate } = body;
        let endDateDay = endDate.toString();
        let end = endDateDay + ' 23:59:59';
        return await this.orderProductRepository
            .createQueryBuilder('op')
            .leftJoinAndSelect('op.order', 'opo')
            .leftJoinAndSelect('op.product', 'opp')
            .andWhere('opp.sellerId = :sellerId', { sellerId: sellerId })
            .andWhere('op.orderStatus = "confirmed"')
            .andWhere('opo.paymentDate >= :startDate', { startDate: startDate })
            .andWhere('opo.paymentDate <= :endDate', { endDate: end })
            .getMany();
    }

    async getSaleExcelData(req: any, body: any): Promise<any> {
        const sellerId = req.seller.sellerId;
        let { startDate, endDate } = body;
        endDate = format(new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        const [row, count] = await this.orderProductRepository
            .createQueryBuilder('op')
            .leftJoinAndSelect('op.product', 'opp')
            .leftJoinAndSelect('op.order', 'opo')
            .andWhere('opp.sellerId = :sellerId', { sellerId: sellerId })
            .andWhere('op.orderStatus = "confirmed"')
            .andWhere('opo.paymentDate >= :startDate', { startDate: startDate })
            .andWhere('opo.paymentDate <= :endDate', { endDate: endDate })
            .getManyAndCount();
        let data = [];
        let saleDate = null;
        for (let i = 0; i < row.length; i++) {
            saleDate = row[i].order.paymentDate;
            saleDate = format(saleDate, 'yyyy-MM-dd');
            data[i] = {
                productId: row[i].product.id,
                skuId: row[i].product.skuId,
                prodName: row[i].product.productName,
                saleCount: Math.floor(count / row.length),
                salePrice: row[i].product.price,
                saleDate: saleDate,
                platForm: row[i].order.platform,
            };
        }
        return data;
    }
}
