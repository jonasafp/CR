import type {
  Customer,
} from "../domain/customers/Customer";

export const initialCustomers:
  Customer[] = [
  {
    id:
      1,

    name:
      "Cliente balcão",

    document:
      "",

    phone:
      "",

    email:
      "",

    address: {
      postalCode:
        "",

      street:
        "",

      number:
        "",

      complement:
        "",

      neighborhood:
        "",

      city:
        "",

      state:
        "",
    },

    notes:
      "Cliente padrão utilizado em vendas sem identificação.",

    status:
      "active",

    createdAt:
      "2026-01-01T00:00:00.000Z",

    updatedAt:
      "2026-01-01T00:00:00.000Z",
  },
];