import { StandardEntity } from 'src/modules/standard.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class User extends StandardEntity {
  @Column('varchar', { nullable: false })
  fullName: string;

  @Column('varchar', { nullable: false })
  password: string;

  @Column('varchar', { nullable: false, unique: true })
  email: string;

  @Column('varchar', { nullable: false, default: 'USER' })
  roles: string[];

}
