const ComfyJS = require("comfy.js");

const events = () => {
  ComfyJS.onRaid = (user, viewers, extra) => {
    viewers > 10 &&
      ComfyJS.Say(
        "/chant @" + user + "dzięki za raida peepoLove ",
        extra.channel
      );
  };

  ComfyJS.onHosted = (user, viewers, autohost, extra) => {
    ComfyJS.Say(
      "/chant @" + user + "dzięki za hosta peepoLove ",
      extra.channel
    );
  };

  ComfyJS.onSubGift = (
    gifterUser,
    streakMonths,
    recipientUser,
    senderCount,
    subTierInfo,
    extra
  ) => {
    if (extra.channel == "og1ii") {
      ComfyJS.Say("og1iiBusiness Yoink", extra.channel);
    } else {
      ComfyJS.Say("gratuluje suba " + recipientUser, extra.channel);
    }

    ComfyJS.Say(
      "/chant @" + gifterUser + " dzięki za gifta peepoLove ",
      extra.channel
    );
  };

  ComfyJS.onResub = (
    user,
    message,
    streamMonths,
    cumulativeMonths,
    subTierInfo,
    extra
  ) => {
    if (extra.channel == "og1ii") {
      ComfyJS.Say("og1iiBusiness Yoink", extra.channel);
    } else {
      ComfyJS.Say(user + " VisLaud", extra.channel);
    }

    ComfyJS.Say(
      "/chant @" + user + " dzięki za suba peepoLove ",
      extra.channel
    );
  };

  ComfyJS.onSub = (user, message, subTierInfo, extra) => {
    if (extra.channel == "og1ii") {
      ComfyJS.Say("og1iiBusiness Yoink", extra.channel);
    } else {
      ComfyJS.Say(user + " VisLaud", extra.channel);
    }

    ComfyJS.Say(
      "/chant @" + user + " dzięki za suba peepoLove ",
      extra.channel
    );
  };
};
module.exports = {
  events
};
