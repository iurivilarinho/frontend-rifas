export type CollaboratorRole = "EDITOR" | "VIEWER";

export interface RaffleCollaboratorApiDto {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  role: CollaboratorRole;
  createdAt: string;
}

export interface AddRaffleCollaboratorRequest {
  email: string;
  role?: CollaboratorRole;
}
