import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('sys_roles')
export class SysRole {
  @PrimaryGeneratedColumn({name: 'role_id' })
  roleId: number;

  @Column({name: 'role_code', length: 50, unique: true})
  roleCode: string;

  @Column({name: 'role_name', length: 100, nullable: true})
  roleName?: string;

  @Column({name: 'description', type: 'text', nullable: true})
  description?: string;
}