import { Entity, Column, PrimaryColumn } from "typeorm";

export const EMAIL_COL_NAME = "email";
export const FIRST_NAME_COL_NAME = "firstName";
export const LAST_NAME_COL_NAME = "lastName";

// Need to expose this class to be set in the repository
@Entity("users")
export class UserEntity {
  public static entityName = "user";

  @PrimaryColumn({ name: EMAIL_COL_NAME })
  email: string;

  @Column({ name: FIRST_NAME_COL_NAME })
  firstName: string;

  @Column({ name: LAST_NAME_COL_NAME })
  lastName: string;
}
