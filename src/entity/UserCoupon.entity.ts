import { Order } from 'src/entity/Order.entity';
import { Coupon } from './Coupon.entity';
import { User } from 'src/entity/User.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'UserCoupons' })
export class UserCoupon {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.userCoupon, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn()
    user: User;

    @ManyToOne(() => Coupon, (coupon) => coupon.userCoupon, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn()
    coupon: Coupon;

    @Column({ default: true })
    status: boolean;

    @Column({ default: false })
    expireMsg: boolean;

    @Column({ nullable: true })
    useTime: Date;

    @Column({ nullable: true })
    expire: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    constructor(partial: Partial<UserCoupon>) {
        Object.assign(this, partial);
    }
}
