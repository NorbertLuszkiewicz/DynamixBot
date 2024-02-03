import { ParticipantDto } from "twisted/dist/models-dto";

export type Server = "EUW" | "EUNE" | "KR" | "NA";
export interface Participant extends ParticipantDto {
  augments?: string[];
}
