import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'MarketingCost' })
export class MarketingCost {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    channel: string;

    @Column({ length: 4 })
    marketingYear: string;

    @Column({ length: 2 })
    marketingMonth: string;

    @Column()
    isGlobal: boolean;

    @Column({ type: 'double', default: 0 })
    cost: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    constructor(partial: Partial<MarketingCost>) {
        Object.assign(this, partial);
    }
}
