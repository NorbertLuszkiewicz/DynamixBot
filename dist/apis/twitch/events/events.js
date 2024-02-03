"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.events = void 0;
const ComfyJS = require("comfy.js");
const events = () => {
    const thanks = [
        "",
        "pierwszy subik VisLaud mam nadzieje ze zostaniesz z nami na dłużej peepoLove",
        "fajnie ze dałeś suba akurat tutaj peepoLove",
        "subik VisLaud",
        "kolejny miesiąc z nami OOOO",
        "sub BRUHBRUH",
        "półroczny subik peepoLove",
        "dał suba VisLaud",
        "kolejny miesiąc z nami peepoLove",
        "dał suba VisLaud",
        "dziesięć miesięcy wspierania streamera BRUHBRUH",
        "dał suba peepoLove prawie rok z nami kezmanGlad",
        "to już roczek BRUHBRUH",
        "subik VisLaud",
        "kolejny miesiąc z nami OOOO",
        "sub BRUHBRUH",
        "kolejny miesiąc z nami peepoLove",
        "dał suba VisLaud",
        "półtora roku z nami peepoLove koksem jesteś nie zmieniaj się",
        "VisLaud",
        "kochany wic dał suba kezmanGlad",
        "piekny jesteś ze dajesz subika akurat tu peepoLove",
        "VisLaud",
        "dał subika OOOO jeszcze miesiąc i 2 lata BRUHBRUH",
        "dwa lata z nami BRUHBRUH",
        "wywalił kolejne pieniądze na streamera Porvalo",
        "zaiwestował w stream peepoLove",
        "kupił subskrybcje peepoLove",
        "subik OOOO",
        "kolejny miesiąc z nami peepoLove",
        "30 miesięcy suba BRUHBRUH",
        "sub BRUHBRUH",
        "kochany wic dał suba kezmanGlad",
        "wydał milion złotych na streamera Porvalo",
        "piekny jesteś ze dajesz subika akurat tu peepoLove",
        "za chwilę 3 lata subskrybowania tego kanału VisLaud",
        "trzy lata z nami OOOO",
    ];
    ComfyJS.onResub = (user, message, streamMonths, cumulativeMonths, subTierInfo, extra) => {
        if (extra.channel == "og1ii") {
            ComfyJS.Say("og1iiBusiness Yoink", extra.channel);
        }
        else {
            ComfyJS.Say(`${user} ${thanks[cumulativeMonths] ? thanks[cumulativeMonths] : "VisLaud"}`, extra.channel);
        }
    };
    ComfyJS.onSub = (user, message, subTierInfo, extra) => {
        if (extra.channel == "og1ii") {
            ComfyJS.Say("og1iiBusiness Yoink", extra.channel);
        }
        else {
            ComfyJS.Say(`${user} ${thanks[1]}`, extra.channel);
        }
    };
};
exports.events = events;
//# sourceMappingURL=events.js.map