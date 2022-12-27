import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Event } from './Event.entity';
import { User } from './User.entity';

@Entity({ name: 'EventFile' })
export class EventFile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true })
    filePath: string;

    @Column({ nullable: true })
    fileOriginalName: string;

    @ManyToOne(() => Event, (event) => event.eventFile, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    event: Event;

    @ManyToOne(() => User, (user) => user.eventFile, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<EventFile>) {
        Object.assign(this, partial);
    }
}
