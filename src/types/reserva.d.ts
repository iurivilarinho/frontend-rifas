import { Pessoa } from "./user";

interface Reservation {
  id?: number;
  raffleId: number;
  quotaIds: number[];
  buyer: UserFormType;
}
