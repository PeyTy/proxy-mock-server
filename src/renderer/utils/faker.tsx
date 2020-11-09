import * as faker from 'faker'

export const replacers = {
  firstName: () => faker.name.firstName(),
  lastName: () => faker.name.lastName(),
  findName: () => faker.name.findName(),

  phoneNumber: () => faker.phone.phoneNumber(),

  number: () => faker.random.number(),
  uuid: () => faker.random.uuid(),
  boolean: () => faker.random.boolean(),

  email: () => faker.internet.email(),
  userName: () => faker.internet.userName(),
}
