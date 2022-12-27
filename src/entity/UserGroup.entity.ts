import { Coupon } from 'src/entity/Coupon.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserGroupUser } from './UserGroup-User.entity';

@Entity({ name: 'UserGroups' })
export class UserGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 20, nullable: true })
    name: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => Coupon, (coupon) => coupon.publishTarget)
    coupon: Coupon;

    @OneToMany(() => UserGroupUser, (uu) => uu.userGroup)
    userGroupUser: UserGroupUser[];

    constructor(partial: Partial<UserGroup>) {
        Object.assign(this, partial);
    }
}
