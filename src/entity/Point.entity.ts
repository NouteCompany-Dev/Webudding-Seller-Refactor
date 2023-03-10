import { User } from 'src/entity/User.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './Order.entity';

@Entity({ name: 'Points' })
export class Point {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'double' })
    point: number;

    @Column({ length: 500, nullable: true }) //사유
    description: string;

    @Column({ length: 20, default: '자동 지급' })
    giveMethod: string;

    @ManyToOne(() => User, (user) => user.usePoint, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column()
    plus: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    constructor(partial: Partial<Point>) {
        Object.assign(this, partial);
    }
}
