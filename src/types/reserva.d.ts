import { Pessoa } from "./pessoa";

interface Reservation {
  id?: number;
  raffleId: number;
  quotaIds: number[];
  buyer: UserFormType;
}
