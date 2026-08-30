import {
  MockCustomerRepository,
} from "./mock/MockCustomerRepository";

import type {
  CustomerRepository,
} from "./CustomerRepository";

function createCustomerRepository():
  CustomerRepository {
  /*
   * Nesta primeira versão os dados são armazenados
   * localmente no navegador.
   *
   * Quando o backend for implementado, a troca poderá
   * ser feita aqui sem alterar páginas ou componentes.
   */
  return new MockCustomerRepository();
}

export const customerRepository =
  createCustomerRepository();