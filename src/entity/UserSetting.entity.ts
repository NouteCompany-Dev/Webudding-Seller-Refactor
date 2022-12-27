import { User } from './User.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'UserSettings' })
export class UserSetting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    agreeWebPush: boolean;

    @Column({ nullable: true })
    agreeWebPushDate: Date;

    @Column({ default: true })
    agreeThirdParty: boolean;

    @Column({ nullable: true })
    agreeThirdPartyDate: Date;

    @Column({ default: false })
    agreeReceiveEmail: boolean;

    @Column({ nullable: true })
    agreeReceiveEmailDate: Date;

    @Column({ default: false })
    agreeReceiveText: boolean;

    @Column({ nullable: true })
    agreeReceiveTextDate: Date;

    @OneToOne(() => User, (user) => user.setting, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn()
    user: User;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

    constructor(partial: Partial<UserSetting>) {
        Object.assign(this, partial);
    }
}
