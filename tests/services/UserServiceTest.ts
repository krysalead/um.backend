import "mocha";
import { expect } from "chai";
import "../../src/iocRegistration";
import { iocContainer } from "../../src/ioc";
import { IUserService } from "../../src/interfaces/services";
import { TYPES } from "../../src/interfaces/types";
import { User } from "../../src/models/User";
import * as sinon from "sinon";
import { CORE_TYPES } from "../../src/core/constants";
import { ISQLService } from "../../src/core/interfaces/services";
import {
  UserEntity,
  EMAIL_COL_NAME,
  LAST_NAME_COL_NAME,
  FIRST_NAME_COL_NAME,
} from "../../src/dao/UserEntity";
import { SQLiteService } from "../../src/core/services/SQLiteService";
import { UserService } from "../../src/services/UserService";

describe("UserService", () => {
  let underTest: IUserService;
  let sqlServiceMock;
  beforeEach(() => {
    let sqlServiceApi = {
      insertSingleEntity: function () {},
      getEntities: function () {},
    };
    sqlServiceMock = sinon.mock(sqlServiceApi);
    underTest = new UserService(sqlServiceMock);
  });
  it("adds a user", async () => {
    const email = "jdoe@test.com";
    let user: User;
    sqlServiceMock.insertSingleEntity = sinon.spy();
    user = await underTest.addUser({
      lastName: "DOE",
      firstName: "john",
      email: email,
    });
    expect(sqlServiceMock.insertSingleEntity.calledOnce).to.equals(true);
  });
  it("lists users", async () => {
    sqlServiceMock.getEntities = sinon.fake.resolves([
      {
        lastName: "DOE",
        firstName: "john",
        email: "john@doe.com",
      },
    ]);
    let listUser: User[] = await underTest.listUser();
    expect(listUser).to.have.lengthOf(1);
    expect(listUser[0].firstName).to.equals("john");
  });
  it("searches users by name in list", async () => {
    let lookUpName = "john";
    sqlServiceMock.getEntities = sinon.fake.resolves([
      {
        lastName: "DOE",
        firstName: "john",
        email: "john@doe.com",
      },
      {
        lastName: "MCLANE",
        firstName: "john",
        email: "john@doe.com",
      },
      {
        lastName: "John",
        firstName: "john",
        email: "john@doe.com",
      },
    ]);
    let listUser: User[] = await underTest.listUser(lookUpName);
    expect(listUser).to.have.lengthOf(3);
    expect(
      sqlServiceMock.getEntities.calledWith(
        UserEntity,
        { field: LAST_NAME_COL_NAME, value: lookUpName },
        { field: FIRST_NAME_COL_NAME, value: lookUpName }
      )
    );
  });
  it("searches users by email in list", async () => {
    let lookUpEmail = "john@doe.com";
    sqlServiceMock.getEntities = sinon.fake.resolves([
      {
        lastName: "DOE",
        firstName: "john",
        email: lookUpEmail,
      },
    ]);
    let listUser: User[] = await underTest.listUser(lookUpEmail);
    expect(listUser).to.have.lengthOf(1);
    expect(
      sqlServiceMock.getEntities.calledWith(UserEntity, {
        field: EMAIL_COL_NAME,
        value: lookUpEmail,
      })
    );
  });
});
