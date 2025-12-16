import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inventory_locations')
export class InventoryLocation {
  @PrimaryGeneratedColumn({ name: 'location_id' })
  location_id: number;

  @Column({ name: 'path', type: 'ltree', unique: true })
  path: string;

  @Column({ name: 'location_name', length: 100, nullable: true })
  location_name?: string;
}
