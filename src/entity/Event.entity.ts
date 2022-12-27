import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { EventFile } from './EventFile.entity';
import { EventImage } from './EventImage.entity';

@Entity({ name: 'Event' })
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    eventName: string;

    @Column({ nullable: true })
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => EventImage, (image) => image.event, { cascade: true })
    image: EventImage[];

    @OneToMany(() => EventFile, (file) => file.event, { cascade: true })
    eventFile: EventFile[];

    constructor(partial: Partial<Event>) {
        Object.assign(this, partial);
    }
}
