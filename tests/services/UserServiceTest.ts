import "mocha";
import { expect } from "chai";
import "../../src/iocRegistration";
import { IUserService } from "../../src/interfaces/services";
import { User } from "../../src/models/User";
import * as sinon from "sinon";
import {
  UserEntity,
  EMAIL_COL_NAME,
  LAST_NAME_COL_NAME,
  FIRST_NAME_COL_NAME,
} from "../../src/dao/UserEntity";
import { UserService, METRIC_TYPE } from "../../src/services/UserService";
import { FUNCMETRICS } from "../../src/constant";

describe("UserService", () => {
  let underTest: IUserService;
  let sqlServiceMock;
  let metricServiceMock;
  beforeEach(() => {
    let sqlServiceApi = {
      insertSingleEntity: function () {},
      getEntities: function () {},
    };
    let metricServiceApi = {
      push: function () {},
    };
    sqlServiceMock = sinon.mock(sqlServiceApi);
    metricServiceMock = sinon.mock(metricServiceApi);
    underTest = new UserService(sqlServiceMock, metricServiceMock);
  });
  it("adds a user", async () => {
    const email = "jdoe@test.com";
    let user: User;
    sqlServiceMock.insertSingleEntity = sinon.spy();
    metricServiceMock.push = sinon.spy();
    user = await underTest.addUser({
      lastName: "DOE",
      firstName: "john",
      email: email,
    });
    expect(sqlServiceMock.insertSingleEntity.calledOnce).to.equals(true);
    expect(metricServiceMock.push.calledOnce).to.equals(true);
  });
  it("lists users", async () => {
    metricServiceMock.push = sinon.spy();
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
    expect(metricServiceMock.push.calledOnce).to.equals(true);
  });
  it("searches users by name in list", async () => {
    let lookUpName = "john";
    metricServiceMock.push = sinon.spy();
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
    expect(
      metricServiceMock.push.calledWith(
        FUNCMETRICS.USER,
        "type",
        METRIC_TYPE.search,
        "kind",
        "name"
      )
    );
  });
  it("searches users by email in list", async () => {
    let lookUpEmail = "john@doe.com";
    metricServiceMock.push = sinon.spy();
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
    expect(
      metricServiceMock.push.calledWith(
        FUNCMETRICS.USER,
        "type",
        METRIC_TYPE.search,
        "kind",
        "email"
      )
    );
  });
});
