import { ParticipantDto } from "twisted/dist/models-dto";

export type Server = "EUW" | "EUNE" | "KR" | "NA";
export interface Participant extends ParticipantDto {
  augments?: string[];
}

export const serverNameToServerId = {
  EUW: "EUW1",
  EUNE: "EUN1",
  NA: "NA1",
  KR: "KR",
};

export const lolPosition = {
  TOP: "TOP",
  JUNGLE: "JG",
  MIDDLE: "MID",
  BOTTOM: "ADC",
  SUPPORT: "SUP",
  UTILITY: "SUP",
};

export const itemIdToName = {
  601: "AcE",
  604: "ArE",
  612: "AsE",
  626: "ChalE",
  630: "ChemE",
  675: "ImE",
  658: "ME",
  726: "SE",
  34: "AS",
  79: "BC",
  16: "BT",
  44: "Blue",
  55: "BV",
  46: "COP",
  11: "DB",
  66: "DC",
  45: "FH",
  56: "Garg",
  12: "GS",
  15: "GA",
  23: "GR",
  49: "HoJ",
  13: "Hex",
  19: "IE",
  36: "IS",
  39: "JG",
  29: "LW",
  35: "Lokt",
  37: "Mor",
  69: "QS",
  33: "Rab",
  22: "RFC",
  47: "Rdmp",
  26: "RH",
  59: "SoS",
  14: "Shoj",
  24: "SS",
  57: "Sun",
  88: "FoN",
  99: "TG",
  25: "TR",
  77: "WM",
  17: "Zeke",
  67: "Zeph",
  27: "ZZR",
};

export const region = {
  EUW1: "EUROPE",
  EUN1: "EUROPE",
  NA1: "AMERICAS",
  KR: "ASIA",
};
