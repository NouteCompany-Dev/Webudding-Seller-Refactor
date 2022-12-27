import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seller } from 'src/entity/Seller.entity';
import { aesDencrypt, aesEncrypt, GenDigestPwd, rsaDencrypt, rsaEncrypt } from 'src/lib/crypto';
import { Repository } from 'typeorm';

@Injectable()
export class SellerRepository {
    constructor(
        @InjectRepository(Seller)
        private sellerRepository: Repository<Seller>,
    ) {}

    async query() {
        return this.sellerRepository.createQueryBuilder('s');
    }

    async create() {
        return this.sellerRepository.create();
    }

    async save(body: Seller) {
        return await this.sellerRepository.save(body);
    }

    async getSeller(body: any): Promise<any> {
        return await this.sellerRepository
            .createQueryBuilder('s')
            .where('s.id = :body', { body: body })
            .getOne();
    }

    async getSellerAndEmail(body: any): Promise<any> {
        return await this.sellerRepository
            .createQueryBuilder('s')
            .where('s.email = :body', { body: body })
            .getOne();
    }

    async getSellerByEnglishBrandName(body: any): Promise<any> {
        return await this.sellerRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.sellerInfo', 'si')
            .where('si.englishBrandName = :brandName', { brandName: body })
            .getOne();
    }

    async checkEmail(body: any): Promise<any> {
        return await this.sellerRepository
            .createQueryBuilder('s')
            .where('s.email = :body', { body: body })
            .andWhere('s.enable = 1')
            .getOne();
    }

    async checkPhone(body: any): Promise<any> {
        return await this.sellerRepository
            .createQueryBuilder('s')
            .where('s.phone = :body', { body: body })
            .getOne();
    }

    async checkBankAccount(body: any): Promise<any> {
        return await this.sellerRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.sellerInfo', 'si')
            .where('si.bankAccount = :body', { body: body })
            .andWhere('s.enable = 1')
            .getOne();
    }

    async checkBrandName(body: any): Promise<any> {
        return await this.sellerRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.sellerInfo', 'si')
            .where('si.brandName = :body', { body: body })
            .andWhere('s.enable = 1')
            .getOne();
    }

    async checkEnglishBrandName(body: any): Promise<any> {
        return await this.sellerRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.sellerInfo', 'si')
            .where('si.englishBrandName = :body', { body: body })
            .andWhere('s.enable = 1')
            .getOne();
    }

    async findByEmail(body: any): Promise<any> {
        return await this.sellerRepository
            .createQueryBuilder('s')
            .where('s.email = :body', { body: body })
            .getOne();
    }

    async encryptPhone(body: any): Promise<any> {
        try {
            const encryptPhone = aesEncrypt(body);
            return encryptPhone;
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async dencryptPhone(body: any) {
        try {
            const dencryptPhone = aesDencrypt(body);
            return dencryptPhone;
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async encryptBankAccount(body: any) {
        try {
            const encryptAccount = aesEncrypt(body);
            return encryptAccount;
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async dencryptBankAccount(body: any) {
        try {
            const dencryptAccount = aesDencrypt(body);
            return dencryptAccount;
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async encryptResidentNumber(body: any) {
        try {
            const encryptResidentNumber = rsaEncrypt(body);
            return encryptResidentNumber;
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async dencryptResidentNumber(body: any) {
        try {
            const dencryptResidentNumber = rsaDencrypt(body);
            return dencryptResidentNumber;
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async encryptPassword(body: any) {
        try {
            const encryptPassword = GenDigestPwd(body);
            return encryptPassword;
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async printEncryptPhone(body: any) {
        try {
            const { phone } = body;
            const encryptPhone = aesEncrypt(phone);
            console.log(encryptPhone);
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async printDencryptPhone(body: any) {
        try {
            const { phone } = body;
            const dencryptPhone = aesDencrypt(phone);
            console.log(dencryptPhone);
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async printEncryptBankAccount(body: any) {
        try {
            const { bankAccount } = body;
            const encryptBankAccount = aesEncrypt(bankAccount);
            console.log(encryptBankAccount);
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async printDencryptBankAccount(body: any) {
        try {
            const { bankAccount } = body;
            const dencryptBankAccount = aesDencrypt(bankAccount);
            console.log(dencryptBankAccount);
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async printEncryptResidentNumber(body: any) {
        try {
            const { residentNumber } = body;
            const encryptResidentNumber = rsaEncrypt(residentNumber);
            console.log(encryptResidentNumber);
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async printDencryptResidentNumber(body: any) {
        try {
            const { residentNumber } = body;
            const dencryptResidentNumber = rsaDencrypt(residentNumber);
            console.log(dencryptResidentNumber);
        } catch {
            return { resultCode: -1, data: null };
        }
    }

    async printEncryptPassword(body: any) {
        try {
            const { password } = body;
            const encryptPassword = GenDigestPwd(password);
            console.log(encryptPassword);
        } catch {
            return { resultCode: -1, data: null };
        }
    }
}
