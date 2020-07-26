import "mocha";
import { expect } from "chai";
import "../../src/iocRegistration";
import { UserController } from "../../src/controllers/UserController";
import { TYPES } from "../../src/interfaces/types";
import { iocContainer } from "../../src/ioc";
import { CORE_TYPES } from "../../src/core/constants";
import { UserEntity } from "../../src/dao/UserEntity";
import { ListUserResponse } from "../../src/io/User.io";

/**
 * Integration test from controller to database
 */
describe("UserController", () => {
  let underTest: UserController;
  let sqlService;
  beforeEach(async () => {
    underTest = new UserController(iocContainer.get(TYPES.UserService));
    sqlService = iocContainer.get(CORE_TYPES.SQLService);
    await sqlService.init();
    await sqlService.executreRawSQL("DELETE from $table", UserEntity);
  });
  it("adds a user", async () => {
    const email = "jdoe@test.com";
    let userToBeAdded = {
      lastName: "DOE",
      firstName: "john",
      email: email,
    };
    let userAdded = underTest.addUser(userToBeAdded, null);
    expect(userAdded).not.equals(null);
    // Never use the other API that could have a bug in it an prefer a direct access
    let userFromDb = await sqlService.executreRawSQL(
      `SELECT * FROM "$table" WHERE email='${email}'`,
      UserEntity
    );
    expect(userFromDb).to.have.lengthOf(1);
  });
  it("lists users when no user", async () => {
    let listUser: ListUserResponse = await underTest.listUser();
    expect(listUser).not.equals(null);
    expect(listUser.data).to.have.lengthOf(0);
  });
  it("lists users when there is user", async () => {
    await sqlService.executreRawSQL(
      'INSERT INTO "$table" ("lastName", "firstName", "email") VALUES ("test", "tester", "tester@test.com")',
      UserEntity
    );
    let listUser: ListUserResponse = await underTest.listUser();
    expect(listUser.data).to.have.lengthOf(1);
    expect(listUser.data[0].firstName).to.equals("tester");
  });
  it("searches users by name in list", async () => {
    let lookUpName = "john";
    // Generic method to fill the database could be used but it add more complexity to the test puttin at risk the maintenance
    await sqlService.executreRawSQL(
      `INSERT INTO "$table" ( "firstName","lastName", "email") VALUES ("test", "tester", "tester@test.com")`,
      UserEntity
    );
    await sqlService.executreRawSQL(
      `INSERT INTO "$table" ("firstName","lastName",  "email") VALUES ("${lookUpName}", "DOE", "john@doe.com")`,
      UserEntity
    );
    await sqlService.executreRawSQL(
      `INSERT INTO "$table" ( "firstName","lastName", "email") VALUES ("${lookUpName}", "mclane", "john@mclane.com")`,
      UserEntity
    );
    await sqlService.executreRawSQL(
      `INSERT INTO "$table" ( "firstName","lastName", "email") VALUES ("Jamie", "${lookUpName}", "jamie@john.com")`,
      UserEntity
    );
    let listUser: ListUserResponse = await underTest.searchUser(lookUpName);
    expect(listUser.data).to.have.lengthOf(3);
  });
  it("searches users by email in list", async () => {
    let lookUpEmail = "john@doe.com";
    await sqlService.executreRawSQL(
      'INSERT INTO "$table" ("lastName", "firstName", "email") VALUES ("test", "tester", "tester@test.com")',
      UserEntity
    );
    await sqlService.executreRawSQL(
      `INSERT INTO "$table" ("lastName", "firstName", "email") VALUES ("john", "DOE", "${lookUpEmail}")`,
      UserEntity
    );
    let listUser: ListUserResponse = await underTest.searchUser(lookUpEmail);
    expect(listUser.data).to.have.lengthOf(1);
  });
});
