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

@Entity({ name: 'EventImage' })
export class EventImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    desktop: boolean;

    @Column({ nullable: true })
    imagePath: string;

    @Column({ nullable: true })
    imageOriginalName: string;

    @ManyToOne(() => Event, (event) => event.image, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn()
    event: Event;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<EventImage>) {
        Object.assign(this, partial);
    }
}
