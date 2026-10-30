/**
 * @version 1.1.4
 */

(function (blocks, editor, element, components, hooks) {
  const { locale, i18n } = blockData || {};

  const browserTz = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  })();

  const siteLocale = (locale && locale.replace("_", "-")) || "en-US";

  const nextUI = {
    __nextHasNoMarginBottom: true,
    __next40pxDefaultSize: true,
  };

  function normalizeLocale(v) {
    if (!v) return "";
    v = v.trim().replace("_", "-");
    if (v.toLowerCase() === "ua") return "uk";
    return v;
  }
  function isValidLocaleTag(tag) {
    if (!tag) return true;
    try {
      return Intl.getCanonicalLocales(tag).length > 0;
    } catch (e) {
      return false;
    }
  }

  const localeOptions = [
    { label: "English (Australia)", value: "en-au" },
    { label: "English (Belize)", value: "en-bz" },
    { label: "English (Canada)", value: "en-ca" },
    { label: "English (Ireland)", value: "en-ie" },
    { label: "English (Jamaica)", value: "en-jm" },
    { label: "English (New Zealand)", value: "en-nz" },
    { label: "English (South Africa)", value: "en-za" },
    { label: "English (Trinidad)", value: "en-tt" },
    { label: "English (United Kingdom)", value: "en-gb" },
    { label: "English (United States)", value: "en-us" },
    { label: "Afrikaans", value: "af" },
    { label: "አማርኛ", value: "am" },
    { label: "العربية", value: "ar" },
    { label: "العربية (الجزائر)", value: "ar-dz" },
    { label: "العربية (البحرين)", value: "ar-bh" },
    { label: "العربية (مصر)", value: "ar-eg" },
    { label: "العربية (العراق)", value: "ar-iq" },
    { label: "العربية (الأردن)", value: "ar-jo" },
    { label: "العربية (الكويت)", value: "ar-kw" },
    { label: "العربية (لبنان)", value: "ar-lb" },
    { label: "العربية (ليبيا)", value: "ar-ly" },
    { label: "العربية (المغرب)", value: "ar-ma" },
    { label: "العربية (عُمان)", value: "ar-om" },
    { label: "العربية (قطر)", value: "ar-qa" },
    { label: "العربية (السعودية)", value: "ar-sa" },
    { label: "العربية (سوريا)", value: "ar-sy" },
    { label: "العربية (تونس)", value: "ar-tn" },
    { label: "العربية (الإمارات)", value: "ar-ae" },
    { label: "العربية (اليمن)", value: "ar-ye" },
    { label: "مصرى", value: "ar-EG" },
    { label: "Azərbaycanlı", value: "az" },
    { label: "Български", value: "bg" },
    { label: "বাংলা", value: "bn" },
    { label: "Bosanski/Босански", value: "bs" },
    { label: "Català", value: "ca" },
    { label: "Čeština", value: "cs" },
    { label: "Dansk", value: "da" },
    { label: "Deutsch", value: "de" },
    { label: "ελληνικά", value: "el" },
    { label: "Español (Argentina)", value: "es-ar" },
    { label: "Español (Bolivia)", value: "es-bo" },
    { label: "Español (Chile)", value: "es-cl" },
    { label: "Español (Colombia)", value: "es-co" },
    { label: "Español (Costa Rica)", value: "es-cr" },
    { label: "Español (República Dominicana)", value: "es-do" },
    { label: "Español (Ecuador)", value: "es-ec" },
    { label: "Español (El Salvador)", value: "es-sv" },
    { label: "Español (Guatemala)", value: "es-gt" },
    { label: "Español (Honduras)", value: "es-hn" },
    { label: "Español (México)", value: "es-mx" },
    { label: "Español (Nicaragua)", value: "es-ni" },
    { label: "Español (Panamá)", value: "es-pa" },
    { label: "Español (Paraguay)", value: "es-py" },
    { label: "Español (Perú)", value: "es-pe" },
    { label: "Español (Puerto Rico)", value: "es-pr" },
    { label: "Español (España)", value: "es" },
    { label: "Eesti", value: "et" },
    { label: "فارسى", value: "fa" },
    { label: "Suomi", value: "fi" },
    { label: "Filipino", value: "fil" },
    { label: "Français", value: "fr" },
    { label: "Français (Belgique)", value: "fr-be" },
    { label: "Français (Canada)", value: "fr-ca" },
    { label: "Français (Luxembourg)", value: "fr-lu" },
    { label: "Français (Standard)", value: "fr" },
    { label: "Français (Suisse)", value: "fr-ch" },
    { label: "Gàidhlig (Alba)", value: "gd" },
    { label: "Deutsch (Österreich)", value: "de-at" },
    { label: "Deutsch (Liechtenstein)", value: "de-li" },
    { label: "Deutsch (Luxemburg)", value: "de-lu" },
    { label: "Deutsch (Standard)", value: "de" },
    { label: "Deutsch (Schweiz)", value: "de-ch" },
    { label: "ગુજરાતી", value: "gu" },
    { label: "עברית", value: "he" },
    { label: "हिंदी", value: "hi" },
    { label: "Hrvatski", value: "hr" },
    { label: "Magyar", value: "hu" },
    { label: "Bahasa Indonesia", value: "id" },
    { label: "íslenska", value: "is" },
    { label: "Italiano", value: "it" },
    { label: "日本語", value: "ja" },
    { label: "ಕನ್ನಡ", value: "kn" },
    { label: "한국어/韓國語 조선말/朝鮮말", value: "ko" },
    { label: "Lietuvių", value: "lt" },
    { label: "Latviešu", value: "lv" },
    { label: "മലയാളം", value: "ml" },
    { label: "मराठी", value: "mr" },
    { label: "Bahasa Malaysia", value: "ms" },
    { label: "Norsk (bokmål)", value: "nb" },
    { label: "Nederlands", value: "nl" },
    { label: "Norsk", value: "no" },
    { label: "Polski", value: "pl" },
    { label: "Português", value: "pt" },
    { label: "Punjabi", value: "pa" },
    { label: "Rumantsch (Rhaeto-Romanic)", value: "rm" },
    { label: "Română (Romanian)", value: "ro" },
    { label: "Română (Republica Moldova)", value: "ro-md" },
    { label: "Русский (Russian)", value: "ru" },
    { label: "Русский (Республика Молдова)", value: "ru-md" },
    { label: "Wendisch (Sorbian)", value: "sb" },
    { label: "Slovenčina", value: "sk" },
    { label: "Slovenski", value: "sl" },
    { label: "Srpski/српски", value: "sr" },
    { label: "Svenska", value: "sv" },
    { label: "Kiswahili", value: "sw" },
    { label: "தமிழ்", value: "ta" },
    { label: "తెలుగు", value: "te" },
    { label: "ไทย", value: "th" },
    { label: "Türkçe", value: "tr" },
    { label: "Українська", value: "uk" },
    { label: "اُردو", value: "ur" },
    { label: "U'zbek/Ўзбек", value: "uz" },
    { label: "ייִדיש (Yiddish)", value: "ji" },
    { label: "Tiếng Việt/㗂越", value: "vi" },
    { label: "中文", value: "zh" },
  ];

  function parseGradientsToHex(gradient) {
    if (gradient) {
      const rgbMatches = gradient.match(
        /rgb(a)?\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+(\.\d+)?)?\)/g
      );
      const hexMatches =
        gradient.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g) || [];

      if (rgbMatches) {
        var rgbToHexColors = rgbMatches.map((rgb) => {
          const [r, g, b] = rgb.match(/\d+/g).map(Number);
          return rgbToHex(r, g, b);
        });

        return rgbToHexColors;
      }
      if (hexMatches) {
        return hexMatches;
      }
    } else {
      return;
    }
  }

  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  var gradients = [
    {
      gradient:
        "linear-gradient(135deg, rgb(255, 228, 196) 0%, rgb(255, 127, 80) 100%)",
      name: "Peach to Coral",
      slug: "peach-to-coral",
    },

    {
      gradient:
        "linear-gradient(135deg, rgb(135, 206, 235) 0%, rgb(25, 25, 112) 100%)",
      name: "Sky blue to Midnight blue",
      slug: "sky-blue-to-midnight-blue",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(255, 192, 203) 0%, rgb(219, 112, 147) 100%)",
      name: "Pink to Deep pink",
      slug: "pink-to-deep-pink",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(173, 216, 230) 0%, rgb(0, 191, 255) 100%)",
      name: "Light blue to Deep sky blue",
      slug: "light-blue-to-deep-sky-blue",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(255, 215, 0) 0%, rgb(218, 165, 32) 100%)",
      name: "Gold to Goldenrod",
      slug: "gold-to-goldenrod",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(106, 17, 203) 0%, rgb(37, 117, 252) 100%)",
      name: "Futuristic Purple to Bright Blue",
      slug: "futuristic-purple-bright-blue",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(248, 87, 166) 0%, rgb(255, 88, 88) 100%)",
      name: "Vibrant Pink to Red",
      slug: "vibrant-pink-red",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(0, 205, 172) 0%, rgb(0, 255, 128) 100%)",
      name: "Mint to Neon Green",
      slug: "mint-neon-green",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)",
      name: "Soft Indigo to Muted Violet",
      slug: "soft-indigo-muted-violet",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(255, 175, 189) 0%, rgb(255, 195, 160) 100%)",
      name: "Pastel Pink to Peach",
      slug: "pastel-pink-peach",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(36, 198, 220) 0%, rgb(81, 74, 157) 100%)",
      name: "Aquamarine to Royal Blue",
      slug: "aquamarine-royal-blue",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(255, 237, 153) 0%, rgb(255, 221, 150) 100%)",
      name: "Sunny Yellow to Orange",
      slug: "sunny-yellow-orange",
    },
    {
      gradient:
        "linear-gradient(135deg,rgba(6,147,227,1) 0%,rgb(155,81,224) 100%)",
      name: "Vivid cyan blue to vivid purple",
      slug: "vivid-cyan-blue-to-vivid-purple",
    },
    {
      gradient:
        "linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%)",
      name: "Light green cyan to vivid green cyan",
      slug: "light-green-cyan-to-vivid-green-cyan",
    },
    {
      gradient:
        "linear-gradient(135deg,rgba(252,185,0,1) 0%,rgba(255,105,0,1) 100%)",
      name: "Luminous vivid amber to luminous vivid orange",
      slug: "luminous-vivid-amber-to-luminous-vivid-orange",
    },
    {
      gradient:
        "linear-gradient(135deg,rgba(255,105,0,1) 0%,rgb(207,46,46) 100%)",
      name: "Luminous vivid orange to vivid red",
      slug: "luminous-vivid-orange-to-vivid-red",
    },
    {
      gradient:
        "linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%)",
      name: "Very light gray to cyan bluish gray",
      slug: "very-light-gray-to-cyan-bluish-gray",
    },
    {
      gradient:
        "linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%)",
      name: "Cool to warm spectrum",
      slug: "cool-to-warm-spectrum",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(255, 224, 0) 0%, rgb(121, 159, 12) 100%)",
      name: "Ver",
      slug: "ver",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(247, 248, 248) 0%, rgb(172, 187, 120) 100%)",
      name: "Ver Black",
      slug: "ver-black",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(52, 51, 80) 0%, rgb(203, 202, 165) 100%)",
      name: "Anwar",
      slug: "anwar",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(0, 82, 212) 0%, rgb(67, 100, 247) 50%, rgb(111, 177, 252) 100%)",
      name: "Bluelagoo",
      slug: "bluelagoo",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(255, 226, 89) 0%, rgb(255, 167, 81) 100%)",
      name: "Mango",
      slug: "mango",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(172, 182, 229) 0%, rgb(134, 253, 232) 100%)",
      name: "Windy",
      slug: "windy",
    },
    {
      gradient:
        "linear-gradient(135deg, rgb(83, 105, 118) 0%, rgb(41, 46, 73) 100%)",
      name: "Royal Blue",
      slug: "royal-blue",
    },
    {
      gradient: "linear-gradient(135deg, #00416A 0%, #E4E5E6 100%)",
      name: "Blu",
      slug: "blu",
    },
    {
      gradient: "linear-gradient(135deg, #FFE000 0%, #799F0C 100%)",
      name: "Ver",
      slug: "ver",
    },
    {
      gradient: "linear-gradient(135deg, #F7F8F8 0%, #ACBB78 100%)",
      name: "Ver Black",
      slug: "ver black",
    },
    {
      gradient:
        "linear-gradient(135deg, #00416A 0%, #799F0C 50%, #FFE000 100%)",
      name: "Combi",
      slug: "combi",
    },
    {
      gradient: "linear-gradient(135deg, #334d50 0%, #cbcaa5 100%)",
      name: "Anwar",
      slug: "anwar",
    },
    {
      gradient:
        "linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)",
      name: "Bluelagoo",
      slug: "bluelagoo",
    },
    {
      gradient:
        "linear-gradient(135deg, #5433FF 0%, #20BDFF 50%, #A5FECB 100%)",
      name: "Lunada",
      slug: "lunada",
    },
    {
      gradient: "linear-gradient(135deg, #799F0C 0%, #ACBB78 100%)",
      name: "Reaqua",
      slug: "reaqua",
    },
    {
      gradient: "linear-gradient(135deg, #ffe259 0%, #ffa751 100%)",
      name: "Mango",
      slug: "mango",
    },
    {
      gradient: "linear-gradient(135deg, #00416A 0%, #E4E5E6 100%)",
      name: "Bupe",
      slug: "bupe",
    },
    {
      gradient: "linear-gradient(135deg, #FFE000 0%, #799F0C 100%)",
      name: "Rea",
      slug: "rea",
    },
    {
      gradient: "linear-gradient(135deg, #acb6e5 0%, #86fde8 100%)",
      name: "Windy",
      slug: "windy",
    },
    {
      gradient: "linear-gradient(135deg, #536976 0%, #292E49 100%)",
      name: "Royal Blue",
      slug: "royal blue",
    },
    {
      gradient:
        "linear-gradient(135deg, #BBD2C5 0%, #536976 50%, #292E49 100%)",
      name: "Royal Blue + Petrol",
      slug: "royal blue + petrol",
    },
    {
      gradient: "linear-gradient(135deg, #B79891 0%, #94716B 100%)",
      name: "Copper",
      slug: "copper",
    },
    {
      gradient: "linear-gradient(135deg, #9796f0 0%, #fbc7d4 100%)",
      name: "Anamnisar",
      slug: "anamnisar",
    },
    {
      gradient: "linear-gradient(135deg, #BBD2C5 0%, #536976 100%)",
      name: "Petrol",
      slug: "petrol",
    },
    {
      gradient: "linear-gradient(135deg, #076585 0%, #fff 100%)",
      name: "Sky",
      slug: "sky",
    },
    {
      gradient: "linear-gradient(135deg, #00467F 0%, #A5CC82 100%)",
      name: "Sel",
      slug: "sel",
    },
    {
      gradient: "linear-gradient(135deg, #1488CC 0%, #2B32B2 100%)",
      name: "Skyline",
      slug: "skyline",
    },
    {
      gradient: "linear-gradient(135deg, #ec008c 0%, #fc6767 100%)",
      name: "DIMIGO",
      slug: "dimigo",
    },
    {
      gradient: "linear-gradient(135deg, #cc2b5e 0%, #753a88 100%)",
      name: "Purple Love",
      slug: "purple love",
    },
    {
      gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
      name: "Sexy Blue",
      slug: "sexy blue",
    },
    {
      gradient: "linear-gradient(135deg, #e65c00 0%, #F9D423 100%)",
      name: "Blooker20",
      slug: "blooker20",
    },
    {
      gradient: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
      name: "Sea Blue",
      slug: "sea blue",
    },
    {
      gradient: "linear-gradient(135deg, #314755 0%, #26a0da 100%)",
      name: "Nimvelo",
      slug: "nimvelo",
    },
    {
      gradient:
        "linear-gradient(135deg, #77A1D3 0%, #79CBCA 50%, #E684AE 100%)",
      name: "Hazel",
      slug: "hazel",
    },
    {
      gradient: "linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)",
      name: "Noon to Dusk",
      slug: "noon to dusk",
    },
    {
      gradient: "linear-gradient(135deg, #e52d27 0%, #b31217 100%)",
      name: "YouTube",
      slug: "youtube",
    },
    {
      gradient: "linear-gradient(135deg, #603813 0%, #b29f94 100%)",
      name: "Cool Brown",
      slug: "cool brown",
    },
    {
      gradient: "linear-gradient(135deg, #16A085 0%, #F4D03F 100%)",
      name: "Harmonic Energy",
      slug: "harmonic energy",
    },
    {
      gradient: "linear-gradient(135deg, #D31027 0%, #EA384D 100%)",
      name: "Playing with Reds",
      slug: "playing with reds",
    },
    {
      gradient: "linear-gradient(135deg, #EDE574 0%, #E1F5C4 100%)",
      name: "Sunny Days",
      slug: "sunny days",
    },
    {
      gradient: "linear-gradient(135deg, #02AAB0 0%, #00CDAC 100%)",
      name: "Green Beach",
      slug: "green beach",
    },
    {
      gradient: "linear-gradient(135deg, #DA22FF 0%, #9733EE 100%)",
      name: "Intuitive Purple",
      slug: "intuitive purple",
    },
    {
      gradient: "linear-gradient(135deg, #348F50 0%, #56B4D3 100%)",
      name: "Emerald Water",
      slug: "emerald water",
    },
    {
      gradient: "linear-gradient(135deg, #3CA55C 0%, #B5AC49 100%)",
      name: "Lemon Twist",
      slug: "lemon twist",
    },
    {
      gradient:
        "linear-gradient(135deg, #CC95C0 0%, #DBD4B4 50%, #7AA1D2 100%)",
      name: "Monte Carlo",
      slug: "monte carlo",
    },
    {
      gradient: "linear-gradient(135deg, #003973 0%, #E5E5BE 100%)",
      name: "Horizon",
      slug: "horizon",
    },
    {
      gradient: "linear-gradient(135deg, #E55D87 0%, #5FC3E4 100%)",
      name: "Rose Water",
      slug: "rose water",
    },
    {
      gradient: "linear-gradient(135deg, #403B4A 0%, #E7E9BB 100%)",
      name: "Frozen",
      slug: "frozen",
    },
    {
      gradient: "linear-gradient(135deg, #F09819 0%, #EDDE5D 100%)",
      name: "Mango Pulp",
      slug: "mango pulp",
    },
    {
      gradient: "linear-gradient(135deg, #FF512F 0%, #DD2476 100%)",
      name: "Bloody Mary",
      slug: "bloody mary",
    },
    {
      gradient: "linear-gradient(135deg, #AA076B 0%, #61045F 100%)",
      name: "Aubergine",
      slug: "aubergine",
    },
    {
      gradient: "linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)",
      name: "Aqua Marine",
      slug: "aqua marine",
    },
    {
      gradient: "linear-gradient(135deg, #FF512F 0%, #F09819 100%)",
      name: "Sunrise",
      slug: "sunrise",
    },
    {
      gradient: "linear-gradient(135deg, #1D2B64 0%, #F8CDDA 100%)",
      name: "Purple Paradise",
      slug: "purple paradise",
    },
    {
      gradient:
        "linear-gradient(135deg, #1FA2FF 0%, #12D8FA 50%, #A6FFCB 100%)",
      name: "Stripe",
      slug: "stripe",
    },
    {
      gradient: "linear-gradient(135deg, #4CB8C4 0%, #3CD3AD 100%)",
      name: "Sea Weed",
      slug: "sea weed",
    },
    {
      gradient: "linear-gradient(135deg, #DD5E89 0%, #F7BB97 100%)",
      name: "Pinky",
      slug: "pinky",
    },
    {
      gradient: "linear-gradient(135deg, #EB3349 0%, #F45C43 100%)",
      name: "Cherry",
      slug: "cherry",
    },
    {
      gradient: "linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)",
      name: "Mojito",
      slug: "mojito",
    },
    {
      gradient: "linear-gradient(135deg, #FF8008 0%, #FFC837 100%)",
      name: "Juicy Orange",
      slug: "juicy orange",
    },
    {
      gradient: "linear-gradient(135deg, #16222A 0%, #3A6073 100%)",
      name: "Mirage",
      slug: "mirage",
    },
    {
      gradient: "linear-gradient(135deg, #1F1C2C 0%, #928DAB 100%)",
      name: "Steel Gray",
      slug: "steel gray",
    },
    {
      gradient: "linear-gradient(135deg, #614385 0%, #516395 100%)",
      name: "Kashmir",
      slug: "kashmir",
    },
    {
      gradient: "linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)",
      name: "Electric Violet",
      slug: "electric violet",
    },
    {
      gradient: "linear-gradient(135deg, #085078 0%, #85D8CE 100%)",
      name: "Venice Blue",
      slug: "venice blue",
    },
    {
      gradient: "linear-gradient(135deg, #2BC0E4 0%, #EAECC6 100%)",
      name: "Bora Bora",
      slug: "bora bora",
    },
    {
      gradient: "linear-gradient(135deg, #134E5E 0%, #71B280 100%)",
      name: "Moss",
      slug: "moss",
    },
    {
      gradient: "linear-gradient(135deg, #5C258D 0%, #4389A2 100%)",
      name: "Shroom Haze",
      slug: "shroom haze",
    },
    {
      gradient: "linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)",
      name: "Mystic",
      slug: "mystic",
    },
    {
      gradient: "linear-gradient(135deg, #232526 0%, #414345 100%)",
      name: "Midnight City",
      slug: "midnight city",
    },
    {
      gradient: "linear-gradient(135deg, #1CD8D2 0%, #93EDC7 100%)",
      name: "Sea Blizz",
      slug: "sea blizz",
    },
    {
      gradient: "linear-gradient(135deg, #3D7EAA 0%, #FFE47A 100%)",
      name: "Opa",
      slug: "opa",
    },
    {
      gradient: "linear-gradient(135deg, #283048 0%, #859398 100%)",
      name: "Titanium",
      slug: "titanium",
    },
    {
      gradient: "linear-gradient(135deg, #24C6DC 0%, #514A9D 100%)",
      name: "Mantle",
      slug: "mantle",
    },
    {
      gradient: "linear-gradient(135deg, #DC2424 0%, #4A569D 100%)",
      name: "Dracula",
      slug: "dracula",
    },
    {
      gradient: "linear-gradient(135deg, #ED4264 0%, #FFEDBC 100%)",
      name: "Peach",
      slug: "peach",
    },
    {
      gradient: "linear-gradient(135deg, #DAE2F8 0%, #D6A4A4 100%)",
      name: "Moonrise",
      slug: "moonrise",
    },
    {
      gradient: "linear-gradient(135deg, #ECE9E6 0%, #FFFFFF 100%)",
      name: "Clouds",
      slug: "clouds",
    },
    {
      gradient: "linear-gradient(135deg, #7474BF 0%, #348AC7 100%)",
      name: "Stellar",
      slug: "stellar",
    },
    {
      gradient: "linear-gradient(135deg, #EC6F66 0%, #F3A183 100%)",
      name: "Bourbon",
      slug: "bourbon",
    },
    {
      gradient: "linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)",
      name: "Calm Darya",
      slug: "calm darya",
    },
    {
      gradient: "linear-gradient(135deg, #C04848 0%, #480048 100%)",
      name: "Influenza",
      slug: "influenza",
    },
    {
      gradient: "linear-gradient(135deg, #e43a15 0%, #e65245 100%)",
      name: "Shrimpy",
      slug: "shrimpy",
    },
    {
      gradient: "linear-gradient(135deg, #414d0b 0%, #727a17 100%)",
      name: "Army",
      slug: "army",
    },
    {
      gradient: "linear-gradient(135deg, #FC354C 0%, #0ABFBC 100%)",
      name: "Miaka",
      slug: "miaka",
    },
    {
      gradient: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
      name: "Pinot Noir",
      slug: "pinot noir",
    },
    {
      gradient: "linear-gradient(135deg, #f857a6 0%, #ff5858 100%)",
      name: "Day Tripper",
      slug: "day tripper",
    },
    {
      gradient: "linear-gradient(135deg, #a73737 0%, #7a2828 100%)",
      name: "Namn",
      slug: "namn",
    },
    {
      gradient: "linear-gradient(135deg, #d53369 0%, #cbad6d 100%)",
      name: "Blurry Beach",
      slug: "blurry beach",
    },
    {
      gradient: "linear-gradient(135deg, #e9d362 0%, #333333 100%)",
      name: "Vasily",
      slug: "vasily",
    },
    {
      gradient: "linear-gradient(135deg, #DE6262 0%, #FFB88C 100%)",
      name: "A Lost Memory",
      slug: "a lost memory",
    },
    {
      gradient: "linear-gradient(135deg, #666600 0%, #999966 100%)",
      name: "Petrichor",
      slug: "petrichor",
    },
    {
      gradient: "linear-gradient(135deg, #FFEEEE 0%, #DDEFBB 100%)",
      name: "Jonquil",
      slug: "jonquil",
    },
    {
      gradient: "linear-gradient(135deg, #EFEFBB 0%, #D4D3DD 100%)",
      name: "Sirius Tamed",
      slug: "sirius tamed",
    },
    {
      gradient: "linear-gradient(135deg, #c21500 0%, #ffc500 100%)",
      name: "Kyoto",
      slug: "kyoto",
    },
    {
      gradient: "linear-gradient(135deg, #215f00 0%, #e4e4d9 100%)",
      name: "Misty Meadow",
      slug: "misty meadow",
    },
    {
      gradient: "linear-gradient(135deg, #50C9C3 0%, #96DEDA 100%)",
      name: "Aqualicious",
      slug: "aqualicious",
    },
    {
      gradient: "linear-gradient(135deg, #616161 0%, #9bc5c3 100%)",
      name: "Moor",
      slug: "moor",
    },
    {
      gradient: "linear-gradient(135deg, #ddd6f3 0%, #faaca8 100%)",
      name: "Almost",
      slug: "almost",
    },
    {
      gradient: "linear-gradient(135deg, #5D4157 0%, #A8CABA 100%)",
      name: "Forever Lost",
      slug: "forever lost",
    },
    {
      gradient: "linear-gradient(135deg, #E6DADA 0%, #274046 100%)",
      name: "Winter",
      slug: "winter",
    },
    {
      gradient: "linear-gradient(135deg, #f2709c 0%, #ff9472 100%)",
      name: "Nelson",
      slug: "nelson",
    },
    {
      gradient: "linear-gradient(135deg, #DAD299 0%, #B0DAB9 100%)",
      name: "Autumn",
      slug: "autumn",
    },
    {
      gradient: "linear-gradient(135deg, #D3959B 0%, #BFE6BA 100%)",
      name: "Candy",
      slug: "candy",
    },
    {
      gradient: "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)",
      name: "Reef",
      slug: "reef",
    },
    {
      gradient: "linear-gradient(135deg, #870000 0%, #190A05 100%)",
      name: "The Strain",
      slug: "the strain",
    },
    {
      gradient: "linear-gradient(135deg, #B993D6 0%, #8CA6DB 100%)",
      name: "Dirty Fog",
      slug: "dirty fog",
    },
    {
      gradient: "linear-gradient(135deg, #649173 0%, #DBD5A4 100%)",
      name: "Earthly",
      slug: "earthly",
    },
    {
      gradient: "linear-gradient(135deg, #C9FFBF 0%, #FFAFBD 100%)",
      name: "Virgin",
      slug: "virgin",
    },
    {
      gradient: "linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)",
      name: "Ash",
      slug: "ash",
    },
    {
      gradient: "linear-gradient(135deg, #FBD3E9 0%, #BB377D 100%)",
      name: "Cherryblossoms",
      slug: "cherryblossoms",
    },
    {
      gradient: "linear-gradient(135deg, #ADD100 0%, #7B920A 100%)",
      name: "Parklife",
      slug: "parklife",
    },
    {
      gradient: "linear-gradient(135deg, #FF4E50 0%, #F9D423 100%)",
      name: "Dance To Forget",
      slug: "dance to forget",
    },
    {
      gradient: "linear-gradient(135deg, #F0C27B 0%, #4B1248 100%)",
      name: "Starfall",
      slug: "starfall",
    },
    {
      gradient: "linear-gradient(135deg, #000000 0%, #e74c3c 100%)",
      name: "Red Mist",
      slug: "red mist",
    },
    {
      gradient: "linear-gradient(135deg, #AAFFA9 0%, #11FFBD 100%)",
      name: "Teal Love",
      slug: "teal love",
    },
    {
      gradient: "linear-gradient(135deg, #B3FFAB 0%, #12FFF7 100%)",
      name: "Neon Life",
      slug: "neon life",
    },
    {
      gradient: "linear-gradient(135deg, #780206 0%, #061161 100%)",
      name: "Man of Steel",
      slug: "man of steel",
    },
    {
      gradient: "linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)",
      name: "Amethyst",
      slug: "amethyst",
    },
    {
      gradient: "linear-gradient(135deg, #556270 0%, #FF6B6B 100%)",
      name: "Cheer Up Emo Kid",
      slug: "cheer up emo kid",
    },
    {
      gradient: "linear-gradient(135deg, #70e1f5 0%, #ffd194 100%)",
      name: "Shore",
      slug: "shore",
    },
    {
      gradient: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
      name: "Facebook Messenger",
      slug: "facebook messenger",
    },
    {
      gradient: "linear-gradient(135deg, #fe8c00 0%, #f83600 100%)",
      name: "SoundCloud",
      slug: "soundcloud",
    },
    {
      gradient: "linear-gradient(135deg, #52c234 0%, #061700 100%)",
      name: "Behongo",
      slug: "behongo",
    },
    {
      gradient: "linear-gradient(135deg, #485563 0%, #29323c 100%)",
      name: "ServQuick",
      slug: "servquick",
    },
    {
      gradient: "linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)",
      name: "Friday",
      slug: "friday",
    },
    {
      gradient: "linear-gradient(135deg, #FDFC47 0%, #24FE41 100%)",
      name: "Martini",
      slug: "martini",
    },
    {
      gradient: "linear-gradient(135deg, #abbaab 0%, #ffffff 100%)",
      name: "Metallic Toad",
      slug: "metallic toad",
    },
    {
      gradient: "linear-gradient(135deg, #73C8A9 0%, #373B44 100%)",
      name: "Between The Clouds",
      slug: "between the clouds",
    },
    {
      gradient: "linear-gradient(135deg, #D38312 0%, #A83279 100%)",
      name: "Crazy Orange I",
      slug: "crazy orange i",
    },
    {
      gradient: "linear-gradient(135deg, #1e130c 0%, #9a8478 100%)",
      name: "Hersheys",
      slug: "hersheys",
    },
    {
      gradient: "linear-gradient(135deg, #948E99 0%, #2E1437 100%)",
      name: "Talking To Mice Elf",
      slug: "talking to mice elf",
    },
    {
      gradient: "linear-gradient(135deg, #360033 0%, #0b8793 100%)",
      name: "Purple Bliss",
      slug: "purple bliss",
    },
    {
      gradient: "linear-gradient(135deg, #FFA17F 0%, #00223E 100%)",
      name: "Predawn",
      slug: "predawn",
    },
    {
      gradient: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
      name: "Endless River",
      slug: "endless river",
    },
    {
      gradient: "linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)",
      name: "Pastel Orange at the Sun",
      slug: "pastel orange at the sun",
    },
    {
      gradient: "linear-gradient(135deg, #6441A5 0%, #2a0845 100%)",
      name: "Twitch",
      slug: "twitch",
    },
    {
      gradient:
        "linear-gradient(135deg, #FEAC5E 0%, #C779D0 50%, #4BC0C8 100%)",
      name: "Atlas",
      slug: "atlas",
    },
    {
      gradient:
        "linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)",
      name: "Instagram",
      slug: "instagram",
    },
    {
      gradient: "linear-gradient(135deg, #ff0084 0%, #33001b 100%)",
      name: "Flickr",
      slug: "flickr",
    },
    {
      gradient: "linear-gradient(135deg, #00bf8f 0%, #001510 100%)",
      name: "Vine",
      slug: "vine",
    },
    {
      gradient: "linear-gradient(135deg, #136a8a 0%, #267871 100%)",
      name: "Turquoise flow",
      slug: "turquoise flow",
    },
    {
      gradient: "linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)",
      name: "Portrait",
      slug: "portrait",
    },
    {
      gradient: "linear-gradient(135deg, #7b4397 0%, #dc2430 100%)",
      name: "Virgin America",
      slug: "virgin america",
    },
    {
      gradient: "linear-gradient(135deg, #D1913C 0%, #FFD194 100%)",
      name: "Koko Caramel",
      slug: "koko caramel",
    },
    {
      gradient: "linear-gradient(135deg, #F1F2B5 0%, #135058 100%)",
      name: "Fresh Turboscent",
      slug: "fresh turboscent",
    },
    {
      gradient: "linear-gradient(135deg, #6A9113 0%, #141517 100%)",
      name: "Green to dark",
      slug: "green to dark",
    },
    {
      gradient: "linear-gradient(135deg, #004FF9 0%, #FFF94C 100%)",
      name: "Ukraine",
      slug: "ukraine",
    },
    {
      gradient: "linear-gradient(135deg, #525252 0%, #3d72b4 100%)",
      name: "Curiosity blue",
      slug: "curiosity blue",
    },
    {
      gradient: "linear-gradient(135deg, #BA8B02 0%, #181818 100%)",
      name: "Dark Knight",
      slug: "dark knight",
    },
    {
      gradient: "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)",
      name: "Piglet",
      slug: "piglet",
    },
    {
      gradient: "linear-gradient(135deg, #304352 0%, #d7d2cc 100%)",
      name: "Lizard",
      slug: "lizard",
    },
    {
      gradient: "linear-gradient(135deg, #CCCCB2 0%, #757519 100%)",
      name: "Sage Persuasion",
      slug: "sage persuasion",
    },
    {
      gradient: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
      name: "Between Night and Day",
      slug: "between night and day",
    },
    {
      gradient: "linear-gradient(135deg, #fc00ff 0%, #00dbde 100%)",
      name: "Timber",
      slug: "timber",
    },
    {
      gradient: "linear-gradient(135deg, #e53935 0%, #e35d5b 100%)",
      name: "Passion",
      slug: "passion",
    },
    {
      gradient: "linear-gradient(135deg, #005C97 0%, #363795 100%)",
      name: "Clear Sky",
      slug: "clear sky",
    },
    {
      gradient: "linear-gradient(135deg, #f46b45 0%, #eea849 100%)",
      name: "Master Card",
      slug: "master card",
    },
    {
      gradient: "linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)",
      name: "Back To Earth",
      slug: "back to earth",
    },
    {
      gradient: "linear-gradient(135deg, #673AB7 0%, #512DA8 100%)",
      name: "Deep Purple",
      slug: "deep purple",
    },
    {
      gradient: "linear-gradient(135deg, #76b852 0%, #8DC26F 100%)",
      name: "Little Leaf",
      slug: "little leaf",
    },
    {
      gradient: "linear-gradient(135deg, #8E0E00 0%, #1F1C18 100%)",
      name: "Netflix",
      slug: "netflix",
    },
    {
      gradient: "linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)",
      name: "Light Orange",
      slug: "light orange",
    },
    {
      gradient: "linear-gradient(135deg, #c2e59c 0%, #64b3f4 100%)",
      name: "Green and Blue",
      slug: "green and blue",
    },
    {
      gradient: "linear-gradient(135deg, #403A3E 0%, #BE5869 100%)",
      name: "Poncho",
      slug: "poncho",
    },
    {
      gradient: "linear-gradient(135deg, #C02425 0%, #F0CB35 100%)",
      name: "Back to the Future",
      slug: "back to the future",
    },
    {
      gradient: "linear-gradient(135deg, #B24592 0%, #F15F79 100%)",
      name: "Blush",
      slug: "blush",
    },
    {
      gradient: "linear-gradient(135deg, #457fca 0%, #5691c8 100%)",
      name: "Inbox",
      slug: "inbox",
    },
    {
      gradient: "linear-gradient(135deg, #6a3093 0%, #a044ff 100%)",
      name: "Purplin",
      slug: "purplin",
    },
    {
      gradient: "linear-gradient(135deg, #eacda3 0%, #d6ae7b 100%)",
      name: "Pale Wood",
      slug: "pale wood",
    },
    {
      gradient: "linear-gradient(135deg, #fd746c 0%, #ff9068 100%)",
      name: "Haikus",
      slug: "haikus",
    },
    {
      gradient: "linear-gradient(135deg, #114357 0%, #F29492 100%)",
      name: "Pizelex",
      slug: "pizelex",
    },
    {
      gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      name: "Joomla",
      slug: "joomla",
    },
    {
      gradient: "linear-gradient(135deg, #2F7336 0%, #AA3A38 100%)",
      name: "Christmas",
      slug: "christmas",
    },
    {
      gradient: "linear-gradient(135deg, #5614B0 0%, #DBD65C 100%)",
      name: "Minnesota Vikings",
      slug: "minnesota vikings",
    },
    {
      gradient: "linear-gradient(135deg, #4DA0B0 0%, #D39D38 100%)",
      name: "Miami Dolphins",
      slug: "miami dolphins",
    },
    {
      gradient: "linear-gradient(135deg, #5A3F37 0%, #2C7744 100%)",
      name: "Forest",
      slug: "forest",
    },
    {
      gradient: "linear-gradient(135deg, #2980b9 0%, #2c3e50 100%)",
      name: "Nighthawk",
      slug: "nighthawk",
    },
    {
      gradient: "linear-gradient(135deg, #0099F7 0%, #F11712 100%)",
      name: "Superman",
      slug: "superman",
    },
    {
      gradient: "linear-gradient(135deg, #834d9b 0%, #d04ed6 100%)",
      name: "Suzy",
      slug: "suzy",
    },
    {
      gradient: "linear-gradient(135deg, #4B79A1 0%, #283E51 100%)",
      name: "Dark Skies",
      slug: "dark skies",
    },
    {
      gradient: "linear-gradient(135deg, #000000 0%, #434343 100%)",
      name: "Deep Space",
      slug: "deep space",
    },
    {
      gradient: "linear-gradient(135deg, #4CA1AF 0%, #C4E0E5 100%)",
      name: "Decent",
      slug: "decent",
    },
    {
      gradient: "linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)",
      name: "hex Of Sky",
      slug: "hex of sky",
    },
    {
      gradient: "linear-gradient(135deg, #BA5370 0%, #F4E2D8 100%)",
      name: "Purple White",
      slug: "purple white",
    },
    {
      gradient: "linear-gradient(135deg, #ff4b1f 0%, #1fddff 100%)",
      name: "Ali",
      slug: "ali",
    },
    {
      gradient: "linear-gradient(135deg, #f7ff00 0%, #db36a4 100%)",
      name: "Alihossein",
      slug: "alihossein",
    },
    {
      gradient: "linear-gradient(135deg, #a80077 0%, #66ff00 100%)",
      name: "Shahabi",
      slug: "shahabi",
    },
    {
      gradient: "linear-gradient(135deg, #1D4350 0%, #A43931 100%)",
      name: "Red Ocean",
      slug: "red ocean",
    },
    {
      gradient: "linear-gradient(135deg, #EECDA3 0%, #EF629F 100%)",
      name: "Tranquil",
      slug: "tranquil",
    },
    {
      gradient: "linear-gradient(135deg, #16BFFD 0%, #CB3066 100%)",
      name: "Transfile",
      slug: "transfile",
    },
    {
      gradient: "linear-gradient(135deg, #ff4b1f 0%, #ff9068 100%)",
      name: "Sylvia",
      slug: "sylvia",
    },
    {
      gradient: "linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)",
      name: "Sweet Morning",
      slug: "sweet morning",
    },
    {
      gradient: "linear-gradient(135deg, #2196f3 0%, #f44336 100%)",
      name: "Politics",
      slug: "politics",
    },
    {
      gradient: "linear-gradient(135deg, #00d2ff 0%, #928DAB 100%)",
      name: "Bright Vault",
      slug: "bright vault",
    },
    {
      gradient: "linear-gradient(135deg, #3a7bd5 0%, #3a6073 100%)",
      name: "Solid Vault",
      slug: "solid vault",
    },
    {
      gradient: "linear-gradient(135deg, #0B486B 0%, #F56217 100%)",
      name: "Sunset",
      slug: "sunset",
    },
    {
      gradient: "linear-gradient(135deg, #e96443 0%, #904e95 100%)",
      name: "Grapefruit Sunset",
      slug: "grapefruit sunset",
    },
    {
      gradient: "linear-gradient(135deg, #2C3E50 0%, #4CA1AF 100%)",
      name: "Deep Sea Space",
      slug: "deep sea space",
    },
    {
      gradient: "linear-gradient(135deg, #2C3E50 0%, #FD746C 100%)",
      name: "Dusk",
      slug: "dusk",
    },
    {
      gradient: "linear-gradient(135deg, #F00000 0%, #DC281E 100%)",
      name: "Minimal Red",
      slug: "minimal red",
    },
    {
      gradient: "linear-gradient(135deg, #141E30 0%, #243B55 100%)",
      name: "Royal",
      slug: "royal",
    },
    {
      gradient: "linear-gradient(135deg, #42275a 0%, #734b6d 100%)",
      name: "Mauve",
      slug: "mauve",
    },
    {
      gradient: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
      name: "Frost",
      slug: "frost",
    },
    {
      gradient: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
      name: "Lush",
      slug: "lush",
    },
    {
      gradient: "linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)",
      name: "Firewatch",
      slug: "firewatch",
    },
    {
      gradient: "linear-gradient(135deg, #f79d00 0%, #64f38c 100%)",
      name: "Sherbert",
      slug: "sherbert",
    },
    {
      gradient: "linear-gradient(135deg, #f85032 0%, #e73827 100%)",
      name: "Blood Red",
      slug: "blood red",
    },
    {
      gradient: "linear-gradient(135deg, #fceabb 0%, #f8b500 100%)",
      name: "Sun on the Horizon",
      slug: "sun on the horizon",
    },
    {
      gradient: "linear-gradient(135deg, #808080 0%, #3fada8 100%)",
      name: "IIIT Delhi",
      slug: "iiit delhi",
    },
    {
      gradient: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
      name: "Jupiter",
      slug: "jupiter",
    },
    {
      gradient: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
      name: "50 Shades of Grey",
      slug: "50 shades of grey",
    },
    {
      gradient: "linear-gradient(135deg, #BE93C5 0%, #7BC6CC 100%)",
      name: "Dania",
      slug: "dania",
    },
    {
      gradient: "linear-gradient(135deg, #A1FFCE 0%, #FAFFD1 100%)",
      name: "Limeade",
      slug: "limeade",
    },
    {
      gradient: "linear-gradient(135deg, #4ECDC4 0%, #556270 100%)",
      name: "Disco",
      slug: "disco",
    },
    {
      gradient: "linear-gradient(135deg, #3a6186 0%, #89253e 100%)",
      name: "Love Couple",
      slug: "love couple",
    },
    {
      gradient: "linear-gradient(135deg, #ef32d9 0%, #89fffd 100%)",
      name: "Azure Pop",
      slug: "azure pop",
    },
    {
      gradient: "linear-gradient(135deg, #de6161 0%, #2657eb 100%)",
      name: "Nepal",
      slug: "nepal",
    },
    {
      gradient: "linear-gradient(135deg, #ff00cc 0%, #333399 100%)",
      name: "Cosmic Fusion",
      slug: "cosmic fusion",
    },
    {
      gradient: "linear-gradient(135deg, #fffc00 0%, #ffffff 100%)",
      name: "Snapchat",
      slug: "snapchat",
    },
    {
      gradient: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)",
      name: "Ed's Sunset Gradient",
      slug: "ed's sunset gradient",
    },
    {
      gradient: "linear-gradient(135deg, #00c3ff 0%, #ffff1c 100%)",
      name: "Brady Brady Fun Fun",
      slug: "brady brady fun fun",
    },
    {
      gradient: "linear-gradient(135deg, #f4c4f3 0%, #fc67fa 100%)",
      name: "Black RosÃ©",
      slug: "black rosã©",
    },
    {
      gradient: "linear-gradient(135deg, #41295a 0%, #2F0743 100%)",
      name: "80's Purple",
      slug: "80's purple",
    },
    {
      gradient:
        "linear-gradient(135deg, #A770EF 0%, #CF8BF3 50%, #FDB99B 100%)",
      name: "Radar",
      slug: "radar",
    },
    {
      gradient: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
      name: "Ibiza Sunset",
      slug: "ibiza sunset",
    },
    {
      gradient: "linear-gradient(135deg, #F3904F 0%, #3B4371 100%)",
      name: "Dawn",
      slug: "dawn",
    },
    {
      gradient: "linear-gradient(135deg, #67B26F 0%, #4ca2cd 100%)",
      name: "Mild",
      slug: "mild",
    },
    {
      gradient: "linear-gradient(135deg, #3494E6 0%, #EC6EAD 100%)",
      name: "Vice City",
      slug: "vice city",
    },
    {
      gradient: "linear-gradient(135deg, #DBE6F6 0%, #C5796D 100%)",
      name: "Jaipur",
      slug: "jaipur",
    },
    {
      gradient:
        "linear-gradient(135deg, #9CECFB 0%, #65C7F7 50%, #0052D4 100%)",
      name: "Jodhpur",
      slug: "jodhpur",
    },
    {
      gradient: "linear-gradient(135deg, #c0c0aa 0%, #1cefff 100%)",
      name: "Cocoaa Ice",
      slug: "cocoaa ice",
    },
    {
      gradient: "linear-gradient(135deg, #DCE35B 0%, #45B649 100%)",
      name: "EasyMed",
      slug: "easymed",
    },
    {
      gradient: "linear-gradient(135deg, #E8CBC0 0%, #636FA4 100%)",
      name: "Rose Colored Lenses",
      slug: "rose colored lenses",
    },
    {
      gradient: "linear-gradient(135deg, #F0F2F0 0%, #000C40 100%)",
      name: "What lies Beyond",
      slug: "what lies beyond",
    },
    {
      gradient: "linear-gradient(135deg, #FFAFBD 0%, #ffc3a0 100%)",
      name: "Roseanna",
      slug: "roseanna",
    },
    {
      gradient: "linear-gradient(135deg, #43C6AC 0%, #F8FFAE 100%)",
      name: "Honey Dew",
      slug: "honey dew",
    },
    {
      gradient: "linear-gradient(135deg, #093028 0%, #237A57 100%)",
      name: "Under the Lake",
      slug: "under the lake",
    },
    {
      gradient: "linear-gradient(135deg, #43C6AC 0%, #191654 100%)",
      name: "The Blue Lagoon",
      slug: "the blue lagoon",
    },
    {
      gradient: "linear-gradient(135deg, #4568DC 0%, #B06AB3 100%)",
      name: "Can You Feel The Love Tonight",
      slug: "can you feel the love tonight",
    },
    {
      gradient: "linear-gradient(135deg, #0575E6 0%, #021B79 100%)",
      name: "Very Blue",
      slug: "very blue",
    },
    {
      gradient: "linear-gradient(135deg, #200122 0%, #6f0000 100%)",
      name: "Love and Liberty",
      slug: "love and liberty",
    },
    {
      gradient: "linear-gradient(135deg, #44A08D 0%, #093637 100%)",
      name: "Orca",
      slug: "orca",
    },
    {
      gradient: "linear-gradient(135deg, #6190E8 0%, #A7BFE8 100%)",
      name: "Venice",
      slug: "venice",
    },
    {
      gradient: "linear-gradient(135deg, #34e89e 0%, #0f3443 100%)",
      name: "Pacific Dream",
      slug: "pacific dream",
    },
    {
      gradient: "linear-gradient(135deg, #F7971E 0%, #FFD200 100%)",
      name: "Learning and Leading",
      slug: "learning and leading",
    },
    {
      gradient: "linear-gradient(135deg, #C33764 0%, #1D2671 100%)",
      name: "Celestial",
      slug: "celestial",
    },
    {
      gradient: "linear-gradient(135deg, #20002c 0%, #cbb4d4 100%)",
      name: "Purplepine",
      slug: "purplepine",
    },
    {
      gradient: "linear-gradient(135deg, #D66D75 0%, #E29587 100%)",
      name: "Sha la la",
      slug: "sha la la",
    },
    {
      gradient: "linear-gradient(135deg, #30E8BF 0%, #FF8235 100%)",
      name: "Mini",
      slug: "mini",
    },
    {
      gradient: "linear-gradient(135deg, #B2FEFA 0%, #0ED2F7 100%)",
      name: "Maldives",
      slug: "maldives",
    },
    {
      gradient: "linear-gradient(135deg, #4AC29A 0%, #BDFFF3 100%)",
      name: "Cinnamint",
      slug: "cinnamint",
    },
    {
      gradient: "linear-gradient(135deg, #E44D26 0%, #F16529 100%)",
      name: "Html",
      slug: "html",
    },
    {
      gradient: "linear-gradient(135deg, #EB5757 0%, #000000 100%)",
      name: "Coal",
      slug: "coal",
    },
    {
      gradient: "linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)",
      name: "Sunkist",
      slug: "sunkist",
    },
    {
      gradient: "linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)",
      name: "Blue Skies",
      slug: "blue skies",
    },
    {
      gradient: "linear-gradient(135deg, #007991 0%, #78ffd6 100%)",
      name: "Chitty Chitty Bang Bang",
      slug: "chitty chitty bang bang",
    },
    {
      gradient: "linear-gradient(135deg, #000046 0%, #1CB5E0 100%)",
      name: "Visions of Grandeur",
      slug: "visions of grandeur",
    },
    {
      gradient: "linear-gradient(135deg, #159957 0%, #155799 100%)",
      name: "Crystal Clear",
      slug: "crystal clear",
    },
    {
      gradient: "linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)",
      name: "Mello",
      slug: "mello",
    },
    {
      gradient: "linear-gradient(135deg, #EF3B36 0%, #FFFFFF 100%)",
      name: "Compare Now",
      slug: "compare now",
    },
    {
      gradient: "linear-gradient(135deg, #283c86 0%, #45a247 100%)",
      name: "Meridian",
      slug: "meridian",
    },
    {
      gradient:
        "linear-gradient(135deg, #3A1C71 0%, #D76D77 50%, #FFAF7B 100%)",
      name: "Relay",
      slug: "relay",
    },
    {
      gradient: "linear-gradient(135deg, #CB356B 0%, #BD3F32 100%)",
      name: "Alive",
      slug: "alive",
    },
    {
      gradient: "linear-gradient(135deg, #36D1DC 0%, #5B86E5 100%)",
      name: "Scooter",
      slug: "scooter",
    },
    {
      gradient: "linear-gradient(135deg, #000000 0%, #0f9b0f 100%)",
      name: "Terminal",
      slug: "terminal",
    },
    {
      gradient: "linear-gradient(135deg, #1c92d2 0%, #f2fcfe 100%)",
      name: "Telegram",
      slug: "telegram",
    },
    {
      gradient: "linear-gradient(135deg, #642B73 0%, #C6426E 100%)",
      name: "Crimson Tide",
      slug: "crimson tide",
    },
    {
      gradient: "linear-gradient(135deg, #06beb6 0%, #48b1bf 100%)",
      name: "Socialive",
      slug: "socialive",
    },
    {
      gradient:
        "linear-gradient(135deg, #0cebeb 0%, #20e3b2 50%, #29ffc6 100%)",
      name: "Subu",
      slug: "subu",
    },
    {
      gradient: "linear-gradient(135deg, #d9a7c7 0%, #fffcdc 100%)",
      name: "Broken Hearts",
      slug: "broken hearts",
    },
    {
      gradient: "linear-gradient(135deg, #396afc 0%, #2948ff 100%)",
      name: "Kimoby Is The New Blue",
      slug: "kimoby is the new blue",
    },
    {
      gradient: "linear-gradient(135deg, #C9D6FF 0%, #E2E2E2 100%)",
      name: "Dull",
      slug: "dull",
    },
    {
      gradient: "linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)",
      name: "Purpink",
      slug: "purpink",
    },
    {
      gradient: "linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)",
      name: "Orange Coral",
      slug: "orange coral",
    },
    {
      gradient: "linear-gradient(135deg, #22c1c3 0%, #fdbb2d 100%)",
      name: "Summer",
      slug: "summer",
    },
    {
      gradient:
        "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)",
      name: "King Yna",
      slug: "king yna",
    },
    {
      gradient: "linear-gradient(135deg, #e1eec3 0%, #f05053 100%)",
      name: "Velvet Sun",
      slug: "velvet sun",
    },
    {
      gradient:
        "linear-gradient(135deg, #ADA996 0%, #F2F2F2 33.33333333333333%, #DBDBDB 66.66666666666666%, #EAEAEA 100%)",
      name: "Zinc",
      slug: "zinc",
    },
    {
      gradient:
        "linear-gradient(135deg, #667db6 0%, #0082c8 33.33333333333333%, #0082c8 66.66666666666666%, #667db6 100%)",
      name: "Hydrogen",
      slug: "hydrogen",
    },
    {
      gradient:
        "linear-gradient(135deg, #03001e 0%, #7303c0 33.33333333333333%, #ec38bc 66.66666666666666%, #fdeff9 100%)",
      name: "Argon",
      slug: "argon",
    },
    {
      gradient: "linear-gradient(135deg, #6D6027 0%, #D3CBB8 100%)",
      name: "Lithium",
      slug: "lithium",
    },
    {
      gradient: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
      name: "Digital Water",
      slug: "digital water",
    },
    {
      gradient: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
      name: "Orange Fun",
      slug: "orange fun",
    },
    {
      gradient: "linear-gradient(135deg, #00F260 0%, #0575E6 100%)",
      name: "Rainbow Blue",
      slug: "rainbow blue",
    },
    {
      gradient: "linear-gradient(135deg, #800080 0%, #ffc0cb 100%)",
      name: "Pink Flavour",
      slug: "pink flavour",
    },
    {
      gradient: "linear-gradient(135deg, #CAC531 0%, #F3F9A7 100%)",
      name: "Sulphur",
      slug: "sulphur",
    },
    {
      gradient: "linear-gradient(135deg, #3C3B3F 0%, #605C3C 100%)",
      name: "Selenium",
      slug: "selenium",
    },
    {
      gradient: "linear-gradient(135deg, #D3CCE3 0%, #E9E4F0 100%)",
      name: "Delicate",
      slug: "delicate",
    },
    {
      gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
      name: "Ohhappiness",
      slug: "ohhappiness",
    },
    {
      gradient:
        "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      name: "Lawrencium",
      slug: "lawrencium",
    },
    {
      gradient: "linear-gradient(135deg, #fffbd5 0%, #b20a2c 100%)",
      name: "Relaxing red",
      slug: "relaxing red",
    },
    {
      gradient: "linear-gradient(135deg, #23074d 0%, #cc5333 100%)",
      name: "Taran Tado",
      slug: "taran tado",
    },
    {
      gradient: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
      name: "Bighead",
      slug: "bighead",
    },
    {
      gradient: "linear-gradient(135deg, #FC466B 0%, #3F5EFB 100%)",
      name: "Sublime Vivid",
      slug: "sublime vivid",
    },
    {
      gradient: "linear-gradient(135deg, #FC5C7D 0%, #6A82FB 100%)",
      name: "Sublime Light",
      slug: "sublime light",
    },
    {
      gradient: "linear-gradient(135deg, #108dc7 0%, #ef8e38 100%)",
      name: "Pun Yeta",
      slug: "pun yeta",
    },
    {
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      name: "Quepal",
      slug: "quepal",
    },
    {
      gradient: "linear-gradient(135deg, #3E5151 0%, #DECBA4 100%)",
      name: "Sand to Blue",
      slug: "sand to blue",
    },
    {
      gradient:
        "linear-gradient(135deg, #40E0D0 0%, #FF8C00 50%, #FF0080 100%)",
      name: "Wedding Day Blues",
      slug: "wedding day blues",
    },
    {
      gradient: "linear-gradient(135deg, #bc4e9c 0%, #f80759 100%)",
      name: "Shifter",
      slug: "shifter",
    },
    {
      gradient:
        "linear-gradient(135deg, #355C7D 0%, #6C5B7B 50%, #C06C84 100%)",
      name: "Red Sunset",
      slug: "red sunset",
    },
    {
      gradient: "linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)",
      name: "Moon Purple",
      slug: "moon purple",
    },
    {
      gradient: "linear-gradient(135deg, #333333 0%, #dd1818 100%)",
      name: "Pure Lust",
      slug: "pure lust",
    },
    {
      gradient: "linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)",
      name: "Slight Ocean View",
      slug: "slight ocean view",
    },
    {
      gradient: "linear-gradient(135deg, #ad5389 0%, #3c1053 100%)",
      name: "eXpresso",
      slug: "expresso",
    },
    {
      gradient: "linear-gradient(135deg, #636363 0%, #a2ab58 100%)",
      name: "Shifty",
      slug: "shifty",
    },
    {
      gradient: "linear-gradient(135deg, #DA4453 0%, #89216B 100%)",
      name: "Vanusa",
      slug: "vanusa",
    },
    {
      gradient: "linear-gradient(135deg, #005AA7 0%, #FFFDE4 100%)",
      name: "Evening Night",
      slug: "evening night",
    },
    {
      gradient:
        "linear-gradient(135deg, #59C173 0%, #a17fe0 50%, #5D26C1 100%)",
      name: "Magic",
      slug: "magic",
    },
    {
      gradient: "linear-gradient(135deg, #FFEFBA 0%, #FFFFFF 100%)",
      name: "Margo",
      slug: "margo",
    },
    {
      gradient: "linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)",
      name: "Blue Raspberry",
      slug: "blue raspberry",
    },
    {
      gradient: "linear-gradient(135deg, #FDC830 0%, #F37335 100%)",
      name: "Citrus Peel",
      slug: "citrus peel",
    },
    {
      gradient: "linear-gradient(135deg, #ED213A 0%, #93291E 100%)",
      name: "Sin City Red",
      slug: "sin city red",
    },
    {
      gradient:
        "linear-gradient(135deg, #1E9600 0%, #FFF200 50%, #FF0000 100%)",
      name: "Rastafari",
      slug: "rastafari",
    },
    {
      gradient: "linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)",
      name: "Summer Dog",
      slug: "summer dog",
    },
    {
      gradient:
        "linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)",
      name: "Wiretap",
      slug: "wiretap",
    },
    {
      gradient: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
      name: "Burning Orange",
      slug: "burning orange",
    },
    {
      gradient: "linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)",
      name: "Ultra Voilet",
      slug: "ultra voilet",
    },
    {
      gradient: "linear-gradient(135deg, #009FFF 0%, #ec2F4B 100%)",
      name: "By Design",
      slug: "by design",
    },
    {
      gradient: "linear-gradient(135deg, #544a7d 0%, #ffd452 100%)",
      name: "Kyoo Tah",
      slug: "kyoo tah",
    },
    {
      gradient: "linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)",
      name: "Kye Meh",
      slug: "kye meh",
    },
    {
      gradient: "linear-gradient(135deg, #dd3e54 0%, #6be585 100%)",
      name: "Kyoo Pal",
      slug: "kyoo pal",
    },
    {
      gradient: "linear-gradient(135deg, #659999 0%, #f4791f 100%)",
      name: "Metapolis",
      slug: "metapolis",
    },
    {
      gradient: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
      name: "Flare",
      slug: "flare",
    },
    {
      gradient: "linear-gradient(135deg, #c31432 0%, #240b36 100%)",
      name: "Witching Hour",
      slug: "witching hour",
    },
    {
      gradient:
        "linear-gradient(135deg, #7F7FD5 0%, #86A8E7 50%, #91EAE4 100%)",
      name: "Azur Lane",
      slug: "azur lane",
    },
    {
      gradient: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",
      name: "Neuromancer",
      slug: "neuromancer",
    },
    {
      gradient: "linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)",
      name: "Harvey",
      slug: "harvey",
    },
    {
      gradient: "linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)",
      name: "Amin",
      slug: "amin",
    },
    {
      gradient:
        "linear-gradient(135deg, #aa4b6b 0%, #6b6b83 50%, #3b8d99 100%)",
      name: "Memariani",
      slug: "memariani",
    },
    {
      gradient: "linear-gradient(135deg, #FF0099 0%, #493240 100%)",
      name: "Yoda",
      slug: "yoda",
    },
    {
      gradient:
        "linear-gradient(135deg, #2980B9 0%, #6DD5FA 50%, #FFFFFF 100%)",
      name: "Cool Sky",
      slug: "cool sky",
    },
    {
      gradient: "linear-gradient(135deg, #373B44 0%, #4286f4 100%)",
      name: "Dark Ocean",
      slug: "dark ocean",
    },
    {
      gradient: "linear-gradient(135deg, #b92b27 0%, #1565C0 100%)",
      name: "Evening Sunshine",
      slug: "evening sunshine",
    },
    {
      gradient:
        "linear-gradient(135deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)",
      name: "JShine",
      slug: "jshine",
    },
    {
      gradient:
        "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)",
      name: "Moonlit Asteroid",
      slug: "moonlit asteroid",
    },
    {
      gradient:
        "linear-gradient(135deg, #C6FFDD 0%, #FBD786 50%, #f7797d 100%)",
      name: "MegaTron",
      slug: "megatron",
    },
    {
      gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
      name: "Cool Blues",
      slug: "cool blues",
    },
    {
      gradient: "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)",
      name: "Piggy Pink",
      slug: "piggy pink",
    },
    {
      gradient: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
      name: "Grade Grey",
      slug: "grade grey",
    },
  ];

  var el = element.createElement;
  var InspectorControls = editor.InspectorControls;
  var Button = components.Button;
  var PanelBody = components.PanelBody;
  var ColorPicker = components.ColorPicker;
  var TextControl = components.TextControl;
  var ExternalLink = components.ExternalLink;
  var RangeControl = components.RangeControl;
  var SelectControl = components.SelectControl;
  var ToggleControl = components.ToggleControl;
  var GradientPicker = components.GradientPicker;
  var ComboboxControl = components.ComboboxControl;
  var Text = components.__experimentalText;
  var Divider = components.__experimentalDivider;
  var ToggleGroupControl = components.__experimentalToggleGroupControl;
  var ToggleGroupControlOption =
    components.__experimentalToggleGroupControlOption;

  function preventComboboxMouseBlur(event) {
    // Keep the action button in place until its click has been delivered.
    if (event.button === 0) event.preventDefault();
  }

  function preventComboboxButtonMouseBlur(event) {
    if (event.target.closest("button")) preventComboboxMouseBlur(event);
  }

  function ClockComboboxControl(props) {
    return el(
      "div",
      { onMouseDownCapture: preventComboboxButtonMouseBlur },
      el(ComboboxControl, props)
    );
  }

  function LocaleControl({ value, onChange }) {
    const [filter, setFilter] = element.useState("");
    const query = normalizeLocale(filter);
    const validQuery = Boolean(query) && isValidLocaleTag(query);
    const labelMatch = localeOptions.some((option) =>
      option.label.toLowerCase().includes(filter.trim().toLowerCase())
    );
    const invalid =
      (Boolean(filter) && !validQuery && !labelMatch) ||
      !isValidLocaleTag(value);
    let options = localeOptions;
    if (value && !options.some((option) => option.value === value)) {
      options = [{ label: value, value }, ...options];
    }
    if (validQuery) {
      options = [
        { label: filter, value: query },
        ...options.filter((option) => option.value !== query),
      ];
    }

    function commit(nextValue) {
      // Intl rejects an empty locale; Reset restores the block's site default.
      const normalized = normalizeLocale(nextValue) || siteLocale;
      if (!isValidLocaleTag(normalized)) return;
      setFilter("");
      onChange(normalized);
    }

    return el(
      "div",
      {
        onBlurCapture: (event) => {
          // Commit typed codes before Core collapses the search input.
          if (
            event.target.getAttribute("role") === "combobox" &&
            validQuery
          ) {
            commit(query);
          }
        },
        onKeyDownCapture: (event) => {
          if (
            event.nativeEvent.isComposing ||
            event.keyCode === 229
          ) return;
          if (event.target.getAttribute("role") !== "combobox") {
            // Older Core lets Reset's Enter select a stale suggestion.
            if (event.key === "Enter") event.stopPropagation();
            return;
          }
          if (event.key === "Escape") setFilter("");
          if (event.key === "Enter" && filter && !validQuery && !labelMatch) {
            // Core may retain an old suggestion when no options match.
            event.preventDefault();
            event.stopPropagation();
          }
        },
      },
      el(ClockComboboxControl, {
        ...nextUI,
        label: i18n["locale"] || "Locale",
        help: invalid
          ? i18n["localeInvalid"] || "Invalid BCP-47 locale tag."
          : i18n["localeHelp"] ||
            "Select or enter a BCP-47 tag (e.g., en-US, uk).",
        value,
        options,
        onFilterValueChange: setFilter,
        onChange: commit,
      }),
      el(
        Button,
        {
          variant: "secondary",
          onMouseDown: preventComboboxMouseBlur,
          onClick: (event) => {
            // Blur commits pending input first, then the explicit action wins.
            event.currentTarget.focus();
            commit(siteLocale);
          },
          style: { marginTop: "0.5rem" },
        },
        i18n["useSiteLocale"] || "Auto language"
      )
    );
  }

  const storedClockAttributeNames = {
    width: "width",
    timeZone: "time-zone",
    fontFamily: "font-family",
    backgroundColor: "background-color",
    background: "background",
    rounded: "rounded",
    second: "second",
    hundredths: "hundredths",
    period: "period",
    date: "date",
    border: "border",
    shadow: "shadow",
    align: "align",
    caption: "caption",
  };
  const storedClockAttributeQuery = Object.fromEntries(
    Object.entries(storedClockAttributeNames).map(([name, attribute]) => [
      name,
      { source: "attribute", attribute },
    ])
  );

  // Recover HTML-only defaults and settings from malformed legacy JSON comments.
  // Explicit valid JSON stays authoritative, including older caption semantics.
  hooks.addFilter(
    "blocks.getBlockAttributes",
    "simple-digital-clock/stored-attributes",
    function (attributes, blockType, innerHTML, commentAttributes) {
      if (blockType.name !== "simple-digital-clock-block/widget-block") {
        return attributes;
      }

      const [stored] = blocks.parseWithAttributeSchema(innerHTML, {
        source: "query",
        selector: "timenow-zone-sdcw",
        query: storedClockAttributeQuery,
      });
      if (!stored) return attributes;

      const savedAttributes = { ...attributes };
      for (const name of Object.keys(storedClockAttributeNames)) {
        if (Object.prototype.hasOwnProperty.call(commentAttributes, name)) {
          if (name === "caption" && typeof commentAttributes.caption === "string") {
            savedAttributes.caption = commentAttributes.caption;
          }
          continue;
        }
        const value = stored[name];
        if (name === "width" || name === "rounded") {
          if (value !== undefined && value.trim() !== "" && Number.isFinite(Number(value))) {
            savedAttributes[name] = Number(value);
          }
        } else if (typeof blockType.attributes[name].default === "boolean") {
          if (value === undefined || value === (name === "period" ? "false" : "true")) {
            savedAttributes[name] = value !== undefined;
          }
        } else {
          savedAttributes[name] = value === undefined ? "" : value;
        }
      }
      return savedAttributes;
    }
  );

  blocks.registerBlockType("simple-digital-clock-block/widget-block", {
    apiVersion: 3,
    title: i18n["title"] || "Simple Digital Clock Widget",
    description: i18n["description"] || "A simple block for displaying text.",
    icon: el(
      "svg",
      { width: 24, height: 24, viewBox: "0 0 24 24" },
      el("path", {
        d: "M2 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2M2 8h20v8H2m1-7v1.5h3.25L3 15h1.75L8 10.5V9m1.25 0v1.5h1.5V9M12 9v1.5h1.5V15H15V9m2 0a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1m-2.5 1.5h2v3h-2m-8.25 0V15h1.5v-1.5",
      })
    ),
    category: "widgets",
    keywords: [
      i18n["time"] || "Time",
      i18n["clock"] || "Clock",
      i18n["date"] || "Date",
      i18n["digital"] || "Digital",
      i18n["simple"] || "Simple",
      i18n["widget"] || "Widget",
      "widget",
      "simple",
      "digital",
      "date",
      "clock",
      "time",
    ],
    attributes: {
      width: {
        type: "number",
        default: 200,
      },
      timeZone: {
        type: "string",
      },
      fontFamily: {
        type: "string",
        default: "",
      },
      backgroundColor: {
        type: "string",
        default: "#1d4ed8",
      },
      background: {
        type: "string",
        default:
          "linear-gradient(135deg, rgb(106, 17, 203) 0%, rgb(37, 117, 252) 100%)",
      },
      locale: {
        type: "string",
        source: "attribute",
        selector: "timenow-zone-sdcw",
        attribute: "locale",
        default: (locale && locale.replace("_", "-")) || "en-US",
      },
      rounded: {
        type: "number",
        default: 0.5,
      },
      second: {
        type: "boolean",
        default: true,
      },
      hundredths: {
        type: "boolean",
        default: false,
      },
      period: { type: "boolean", default: false },
      date: { type: "boolean", default: false },
      border: { type: "boolean", default: false },
      shadow: {
        type: "string",
        default: "",
      },
      align: {
        type: "string",
        default: "left",
      },
      caption: {
        type: "string",
        default: "",
      },
    },
    // Apply the browser timezone only when inserting a new block.
    // Parsed legacy defaults are recovered from the saved HTML above.
    variations: [
      {
        name: "local-time",
        isDefault: true,
        scope: ["inserter"],
        attributes: { timeZone: browserTz },
      },
    ],
    edit: function (props) {
      var align = props.attributes.align;
      var width = props.attributes.width;
      var period = props.attributes.period;
      var caption = props.attributes.caption;
      var date = props.attributes.date;
      var second = props.attributes.second;
      var hundredths = props.attributes.hundredths;
      var rounded = props.attributes.rounded;
      var timeZone = props.attributes.timeZone;
      var backgroundColor = props.attributes.backgroundColor;
      var background = props.attributes.background;
      var border = props.attributes.border;
      var locale = props.attributes.locale;
      var fontFamily = props.attributes.fontFamily;
      var shadow = props.attributes.shadow;

      var blockProps = editor.useBlockProps();

      function onChangeBackgroundColor(newValue) {
        // console.log(newValue);
        props.setAttributes({ backgroundColor: newValue.hex });
      }

      function onChangeWidth(newValue) {
        props.setAttributes({ width: newValue });
      }

      function onChangeRounded(newValue) {
        props.setAttributes({ rounded: newValue });
      }

      function onChangeSecond(newValue) {
        props.setAttributes({ second: newValue });
      }

      function onChangeHundredths(newValue) {
        props.setAttributes({ hundredths: newValue });
      }

      function onChangePeriod(newValue) {
        props.setAttributes({ period: newValue });
      }

      function onChangeCaption(newValue) {
        props.setAttributes({ caption: newValue });
      }

      function onChangeDate(newValue) {
        props.setAttributes({ date: newValue });
      }

      function onChangeTimeZone(newValue) {
        // Core's Reset passes null; the legacy string schema expects "".
        props.setAttributes({ timeZone: newValue == null ? "" : newValue });
      }

      function onChangeFontFamily(newValue) {
        props.setAttributes({ fontFamily: newValue });
      }

      function onChangeLocale(newValue) {
        props.setAttributes({ locale: normalizeLocale(newValue) });
      }
      function onChangeBorder(newValue) {
        props.setAttributes({ border: newValue });
      }

      function onChangeAlign(newValue) {
        props.setAttributes({ align: newValue });
      }

      function onChangeBackground(newValue) {
        props.setAttributes({ background: newValue });
      }

      function onChangeShadow(newValue) {
        props.setAttributes({ shadow: newValue });
      }

      return [
        el(
          InspectorControls,
          null,
          el(
            PanelBody,
            { title: i18n["container"] || "Container", initialOpen: false },
            [
              el(TextControl, {
                ...nextUI,
                label: i18n["caption"] || "Caption",
                value: props.attributes.caption,
                onChange: onChangeCaption,
              }),
              el(ToggleGroupControl, {
                ...nextUI,
                label: i18n["textAlign"] || "Text Align", // Fallback label if i18n is not defined
                help:
                  i18n["textAlignHelp"] ||
                  "Select the alignment of the text within the container.",
                onChange: onChangeAlign,
                value: props.attributes.align,
                children: [
                  el(ToggleGroupControlOption, {
                    ...nextUI,
                    label: i18n["left"] || "Left",
                    value: "left",
                  }),
                  el(ToggleGroupControlOption, {
                    ...nextUI,

                    label: i18n["center"] || "Center",
                    value: "center",
                  }),
                  el(ToggleGroupControlOption, {
                    ...nextUI,
                    label: i18n["right"] || "Right",
                    value: "right",
                  }),
                ],
              }),
              el(RangeControl, {
                ...nextUI,
                label: i18n["width"] || "Width",
                value: props.attributes.width,
                onChange: onChangeWidth,
                min: 0,
                step: 1,
                max: 1000,
              }),
              el(ToggleControl, {
                ...nextUI,
                label: i18n["fullSize"] || "Full size",
                checked: props.attributes.width === 0,
                onChange: () => {
                  onChangeWidth(props.attributes.width === 0 ? 200 : 0);
                },
              }),
              el(RangeControl, {
                ...nextUI,
                label: i18n["rounded"] || "Rounded",
                value: props.attributes.rounded,
                onChange: onChangeRounded,
                min: 0,
                max: 10,
                step: 0.01,
              }),
              el(ToggleControl, {
                ...nextUI,
                label: i18n["border"] || "Border",
                checked: props.attributes.border,
                onChange: onChangeBorder,
              }),
              el(ToggleGroupControl, {
                ...nextUI,
                label: i18n["shadow"] || "Shadow",
                help:
                  i18n["shdowHelp"] || "Select the shadow of the container.",
                onChange: onChangeShadow,
                value: props.attributes.shadow,
                children: [
                  el(ToggleGroupControlOption, {
                    label: i18n["none"] || "None",
                    value: "",
                  }),
                  el(ToggleGroupControlOption, {
                    label: "XS",
                    value: "shadow-sm",
                  }),
                  el(ToggleGroupControlOption, {
                    label: "S",
                    value: "shadow",
                  }),
                  el(ToggleGroupControlOption, {
                    label: "MD",
                    value: "shadow-md",
                  }),
                  el(ToggleGroupControlOption, {
                    label: "LG",
                    value: "shadow-lg",
                  }),
                  el(ToggleGroupControlOption, {
                    label: "XL",
                    value: "shadow-xl",
                  }),
                ],
              }),
            ]
          ),
          el(
            PanelBody,
            {
              title: i18n["backgroundColor"] || "Background Color",
              initialOpen: false,
            },
            [
              el(
                Button,
                {
                  variant: "secondary",
                  onClick: () => {
                    onChangeBackgroundColor({ hex: "" });
                    onChangeBackground();
                  },
                },
                i18n["clearColors"] || "Clear Colors"
              ),
              el(Divider, { style: { margin: "1rem 0" } }),
              el(ColorPicker, {
                label: i18n["color"] || "Color",
                color: props.attributes.backgroundColor,
                onChangeComplete: onChangeBackgroundColor,
                disableAlpha: true,
              }),
              el(
                Text,
                {},
                i18n["gradientHelp"] ||
                  "Select a gradient (font color is automatically inverted based on background color)."
              ),
              el(Divider, { style: { margin: "1rem 0" } }),
              el(
                Button,
                {
                  variant: "secondary",
                  onClick: () => {
                    onChangeBackground();
                  },
                },
                i18n["clearGradient"] || "Clear Gradient"
              ),
              el(Divider, { style: { margin: "1rem 0" } }),
              el(GradientPicker, {
                label: i18n["gradient"] || "Gradient",
                clearable: true,
                gradients,
                value: props.attributes.background,
                onChange: (value) => {
                  var gradientColors = parseGradientsToHex(value);
                  if (gradientColors && gradientColors.length > 0) {
                    onChangeBackgroundColor({ hex: gradientColors[0] });
                    onChangeBackground(value);
                  }
                },
                disableAlpha: true,
              }),
            ]
          ),
          el(
            PanelBody,
            { title: i18n["options"] || "Options", initialOpen: true },
            [
              el(ClockComboboxControl, {
                ...nextUI,
                label: i18n["timeZone"] || "Time Zone",
                help:
                  i18n["timeZoneHelp"] ||
                  "Select the time zone for the clock display.",
                value: props.attributes.timeZone,
                options: [
                  { label: "UTC", value: "UTC" },
                  { label: "Africa/Abidjan", value: "Africa/Abidjan" },
                  { label: "Africa/Accra", value: "Africa/Accra" },
                  { label: "Africa/Addis_Ababa", value: "Africa/Addis_Ababa" },
                  { label: "Africa/Algiers", value: "Africa/Algiers" },
                  { label: "Africa/Asmera", value: "Africa/Asmera" },
                  { label: "Africa/Bamako", value: "Africa/Bamako" },
                  { label: "Africa/Bangui", value: "Africa/Bangui" },
                  { label: "Africa/Banjul", value: "Africa/Banjul" },
                  { label: "Africa/Bissau", value: "Africa/Bissau" },
                  { label: "Africa/Blantyre", value: "Africa/Blantyre" },
                  { label: "Africa/Brazzaville", value: "Africa/Brazzaville" },
                  { label: "Africa/Bujumbura", value: "Africa/Bujumbura" },
                  { label: "Africa/Cairo", value: "Africa/Cairo" },
                  { label: "Africa/Casablanca", value: "Africa/Casablanca" },
                  { label: "Africa/Ceuta", value: "Africa/Ceuta" },
                  { label: "Africa/Conakry", value: "Africa/Conakry" },
                  { label: "Africa/Dakar", value: "Africa/Dakar" },
                  {
                    label: "Africa/Dar_es_Salaam",
                    value: "Africa/Dar_es_Salaam",
                  },
                  { label: "Africa/Djibouti", value: "Africa/Djibouti" },
                  { label: "Africa/Douala", value: "Africa/Douala" },
                  { label: "Africa/El_Aaiun", value: "Africa/El_Aaiun" },
                  { label: "Africa/Freetown", value: "Africa/Freetown" },
                  { label: "Africa/Gaborone", value: "Africa/Gaborone" },
                  { label: "Africa/Harare", value: "Africa/Harare" },
                  {
                    label: "Africa/Johannesburg",
                    value: "Africa/Johannesburg",
                  },
                  { label: "Africa/Juba", value: "Africa/Juba" },
                  { label: "Africa/Kampala", value: "Africa/Kampala" },
                  { label: "Africa/Khartoum", value: "Africa/Khartoum" },
                  { label: "Africa/Kigali", value: "Africa/Kigali" },
                  { label: "Africa/Kinshasa", value: "Africa/Kinshasa" },
                  { label: "Africa/Lagos", value: "Africa/Lagos" },
                  { label: "Africa/Libreville", value: "Africa/Libreville" },
                  { label: "Africa/Lome", value: "Africa/Lome" },
                  { label: "Africa/Luanda", value: "Africa/Luanda" },
                  { label: "Africa/Lubumbashi", value: "Africa/Lubumbashi" },
                  { label: "Africa/Lusaka", value: "Africa/Lusaka" },
                  { label: "Africa/Malabo", value: "Africa/Malabo" },
                  { label: "Africa/Maputo", value: "Africa/Maputo" },
                  { label: "Africa/Maseru", value: "Africa/Maseru" },
                  { label: "Africa/Mbabane", value: "Africa/Mbabane" },
                  { label: "Africa/Mogadishu", value: "Africa/Mogadishu" },
                  { label: "Africa/Monrovia", value: "Africa/Monrovia" },
                  { label: "Africa/Nairobi", value: "Africa/Nairobi" },
                  { label: "Africa/Ndjamena", value: "Africa/Ndjamena" },
                  { label: "Africa/Niamey", value: "Africa/Niamey" },
                  { label: "Africa/Nouakchott", value: "Africa/Nouakchott" },
                  { label: "Africa/Ouagadougou", value: "Africa/Ouagadougou" },
                  { label: "Africa/Porto-Novo", value: "Africa/Porto-Novo" },
                  { label: "Africa/Sao_Tome", value: "Africa/Sao_Tome" },
                  { label: "Africa/Tripoli", value: "Africa/Tripoli" },
                  { label: "Africa/Tunis", value: "Africa/Tunis" },
                  { label: "Africa/Windhoek", value: "Africa/Windhoek" },
                  { label: "America/Adak", value: "America/Adak" },
                  { label: "America/Anchorage", value: "America/Anchorage" },
                  { label: "America/Anguilla", value: "America/Anguilla" },
                  { label: "America/Antigua", value: "America/Antigua" },
                  { label: "America/Araguaina", value: "America/Araguaina" },
                  {
                    label: "America/Argentina/La_Rioja",
                    value: "America/Argentina/La_Rioja",
                  },
                  {
                    label: "America/Argentina/Rio_Gallegos",
                    value: "America/Argentina/Rio_Gallegos",
                  },
                  {
                    label: "America/Argentina/Salta",
                    value: "America/Argentina/Salta",
                  },
                  {
                    label: "America/Argentina/San_Juan",
                    value: "America/Argentina/San_Juan",
                  },
                  {
                    label: "America/Argentina/San_Luis",
                    value: "America/Argentina/San_Luis",
                  },
                  {
                    label: "America/Argentina/Tucuman",
                    value: "America/Argentina/Tucuman",
                  },
                  {
                    label: "America/Argentina/Ushuaia",
                    value: "America/Argentina/Ushuaia",
                  },
                  { label: "America/Aruba", value: "America/Aruba" },
                  { label: "America/Asuncion", value: "America/Asuncion" },
                  { label: "America/Bahia", value: "America/Bahia" },
                  {
                    label: "America/Bahia_Banderas",
                    value: "America/Bahia_Banderas",
                  },
                  { label: "America/Barbados", value: "America/Barbados" },
                  { label: "America/Belem", value: "America/Belem" },
                  { label: "America/Belize", value: "America/Belize" },
                  {
                    label: "America/Blanc-Sablon",
                    value: "America/Blanc-Sablon",
                  },
                  { label: "America/Boa_Vista", value: "America/Boa_Vista" },
                  { label: "America/Bogota", value: "America/Bogota" },
                  { label: "America/Boise", value: "America/Boise" },
                  {
                    label: "America/Buenos_Aires",
                    value: "America/Buenos_Aires",
                  },
                  {
                    label: "America/Cambridge_Bay",
                    value: "America/Cambridge_Bay",
                  },
                  {
                    label: "America/Campo_Grande",
                    value: "America/Campo_Grande",
                  },
                  { label: "America/Cancun", value: "America/Cancun" },
                  { label: "America/Caracas", value: "America/Caracas" },
                  { label: "America/Catamarca", value: "America/Catamarca" },
                  { label: "America/Cayenne", value: "America/Cayenne" },
                  { label: "America/Cayman", value: "America/Cayman" },
                  { label: "America/Chicago", value: "America/Chicago" },
                  { label: "America/Chihuahua", value: "America/Chihuahua" },
                  {
                    label: "America/Ciudad_Juarez",
                    value: "America/Ciudad_Juarez",
                  },
                  {
                    label: "America/Coral_Harbour",
                    value: "America/Coral_Harbour",
                  },
                  { label: "America/Cordoba", value: "America/Cordoba" },
                  { label: "America/Costa_Rica", value: "America/Costa_Rica" },
                  { label: "America/Creston", value: "America/Creston" },
                  { label: "America/Cuiaba", value: "America/Cuiaba" },
                  { label: "America/Curacao", value: "America/Curacao" },
                  {
                    label: "America/Danmarkshavn",
                    value: "America/Danmarkshavn",
                  },
                  { label: "America/Dawson", value: "America/Dawson" },
                  {
                    label: "America/Dawson_Creek",
                    value: "America/Dawson_Creek",
                  },
                  { label: "America/Denver", value: "America/Denver" },
                  { label: "America/Detroit", value: "America/Detroit" },
                  { label: "America/Dominica", value: "America/Dominica" },
                  { label: "America/Edmonton", value: "America/Edmonton" },
                  { label: "America/Eirunepe", value: "America/Eirunepe" },
                  {
                    label: "America/El_Salvador",
                    value: "America/El_Salvador",
                  },
                  {
                    label: "America/Fort_Nelson",
                    value: "America/Fort_Nelson",
                  },
                  { label: "America/Fortaleza", value: "America/Fortaleza" },
                  { label: "America/Glace_Bay", value: "America/Glace_Bay" },
                  { label: "America/Godthab", value: "America/Godthab" },
                  { label: "America/Goose_Bay", value: "America/Goose_Bay" },
                  { label: "America/Grand_Turk", value: "America/Grand_Turk" },
                  { label: "America/Grenada", value: "America/Grenada" },
                  { label: "America/Guadeloupe", value: "America/Guadeloupe" },
                  { label: "America/Guatemala", value: "America/Guatemala" },
                  { label: "America/Guayaquil", value: "America/Guayaquil" },
                  { label: "America/Guyana", value: "America/Guyana" },
                  { label: "America/Halifax", value: "America/Halifax" },
                  { label: "America/Havana", value: "America/Havana" },
                  { label: "America/Hermosillo", value: "America/Hermosillo" },
                  {
                    label: "America/Indiana/Knox",
                    value: "America/Indiana/Knox",
                  },
                  {
                    label: "America/Indiana/Marengo",
                    value: "America/Indiana/Marengo",
                  },
                  {
                    label: "America/Indiana/Petersburg",
                    value: "America/Indiana/Petersburg",
                  },
                  {
                    label: "America/Indiana/Tell_City",
                    value: "America/Indiana/Tell_City",
                  },
                  {
                    label: "America/Indiana/Vevay",
                    value: "America/Indiana/Vevay",
                  },
                  {
                    label: "America/Indiana/Vincennes",
                    value: "America/Indiana/Vincennes",
                  },
                  {
                    label: "America/Indiana/Winamac",
                    value: "America/Indiana/Winamac",
                  },
                  {
                    label: "America/Indianapolis",
                    value: "America/Indianapolis",
                  },
                  { label: "America/Inuvik", value: "America/Inuvik" },
                  { label: "America/Iqaluit", value: "America/Iqaluit" },
                  { label: "America/Jamaica", value: "America/Jamaica" },
                  { label: "America/Jujuy", value: "America/Jujuy" },
                  { label: "America/Juneau", value: "America/Juneau" },
                  {
                    label: "America/Kentucky/Monticello",
                    value: "America/Kentucky/Monticello",
                  },
                  { label: "America/Kralendijk", value: "America/Kralendijk" },
                  { label: "America/La_Paz", value: "America/La_Paz" },
                  { label: "America/Lima", value: "America/Lima" },
                  {
                    label: "America/Los_Angeles",
                    value: "America/Los_Angeles",
                  },
                  { label: "America/Louisville", value: "America/Louisville" },
                  {
                    label: "America/Lower_Princes",
                    value: "America/Lower_Princes",
                  },
                  { label: "America/Maceio", value: "America/Maceio" },
                  { label: "America/Managua", value: "America/Managua" },
                  { label: "America/Manaus", value: "America/Manaus" },
                  { label: "America/Marigot", value: "America/Marigot" },
                  { label: "America/Martinique", value: "America/Martinique" },
                  { label: "America/Matamoros", value: "America/Matamoros" },
                  { label: "America/Mazatlan", value: "America/Mazatlan" },
                  { label: "America/Mendoza", value: "America/Mendoza" },
                  { label: "America/Menominee", value: "America/Menominee" },
                  { label: "America/Merida", value: "America/Merida" },
                  { label: "America/Metlakatla", value: "America/Metlakatla" },
                  {
                    label: "America/Mexico_City",
                    value: "America/Mexico_City",
                  },
                  { label: "America/Miquelon", value: "America/Miquelon" },
                  { label: "America/Moncton", value: "America/Moncton" },
                  { label: "America/Monterrey", value: "America/Monterrey" },
                  { label: "America/Montevideo", value: "America/Montevideo" },
                  { label: "America/Montserrat", value: "America/Montserrat" },
                  { label: "America/Nassau", value: "America/Nassau" },
                  { label: "America/New_York", value: "America/New_York" },
                  { label: "America/Nipigon", value: "America/Nipigon" },
                  { label: "America/Nome", value: "America/Nome" },
                  { label: "America/Noronha", value: "America/Noronha" },
                  {
                    label: "America/North_Dakota/Beulah",
                    value: "America/North_Dakota/Beulah",
                  },
                  {
                    label: "America/North_Dakota/Center",
                    value: "America/North_Dakota/Center",
                  },
                  {
                    label: "America/North_Dakota/New_Salem",
                    value: "America/North_Dakota/New_Salem",
                  },
                  { label: "America/Ojinaga", value: "America/Ojinaga" },
                  { label: "America/Panama", value: "America/Panama" },
                  {
                    label: "America/Pangnirtung",
                    value: "America/Pangnirtung",
                  },
                  { label: "America/Paramaribo", value: "America/Paramaribo" },
                  { label: "America/Phoenix", value: "America/Phoenix" },
                  {
                    label: "America/Port-au-Prince",
                    value: "America/Port-au-Prince",
                  },
                  {
                    label: "America/Port_of_Spain",
                    value: "America/Port_of_Spain",
                  },
                  {
                    label: "America/Porto_Velho",
                    value: "America/Porto_Velho",
                  },
                  {
                    label: "America/Puerto_Rico",
                    value: "America/Puerto_Rico",
                  },
                  {
                    label: "America/Punta_Arenas",
                    value: "America/Punta_Arenas",
                  },
                  {
                    label: "America/Rainy_River",
                    value: "America/Rainy_River",
                  },
                  {
                    label: "America/Rankin_Inlet",
                    value: "America/Rankin_Inlet",
                  },
                  { label: "America/Recife", value: "America/Recife" },
                  { label: "America/Regina", value: "America/Regina" },
                  { label: "America/Resolute", value: "America/Resolute" },
                  { label: "America/Rio_Branco", value: "America/Rio_Branco" },
                  {
                    label: "America/Santa_Isabel",
                    value: "America/Santa_Isabel",
                  },
                  { label: "America/Santarem", value: "America/Santarem" },
                  { label: "America/Santiago", value: "America/Santiago" },
                  {
                    label: "America/Santo_Domingo",
                    value: "America/Santo_Domingo",
                  },
                  { label: "America/Sao_Paulo", value: "America/Sao_Paulo" },
                  {
                    label: "America/Scoresbysund",
                    value: "America/Scoresbysund",
                  },
                  { label: "America/Sitka", value: "America/Sitka" },
                  {
                    label: "America/St_Barthelemy",
                    value: "America/St_Barthelemy",
                  },
                  { label: "America/St_Johns", value: "America/St_Johns" },
                  { label: "America/St_Kitts", value: "America/St_Kitts" },
                  { label: "America/St_Lucia", value: "America/St_Lucia" },
                  { label: "America/St_Thomas", value: "America/St_Thomas" },
                  { label: "America/St_Vincent", value: "America/St_Vincent" },
                  {
                    label: "America/Swift_Current",
                    value: "America/Swift_Current",
                  },
                  {
                    label: "America/Tegucigalpa",
                    value: "America/Tegucigalpa",
                  },
                  { label: "America/Thule", value: "America/Thule" },
                  {
                    label: "America/Thunder_Bay",
                    value: "America/Thunder_Bay",
                  },
                  { label: "America/Tijuana", value: "America/Tijuana" },
                  { label: "America/Toronto", value: "America/Toronto" },
                  { label: "America/Tortola", value: "America/Tortola" },
                  { label: "America/Vancouver", value: "America/Vancouver" },
                  { label: "America/Whitehorse", value: "America/Whitehorse" },
                  { label: "America/Winnipeg", value: "America/Winnipeg" },
                  { label: "America/Yakutat", value: "America/Yakutat" },
                  {
                    label: "America/Yellowknife",
                    value: "America/Yellowknife",
                  },
                  { label: "Antarctica/Casey", value: "Antarctica/Casey" },
                  { label: "Antarctica/Davis", value: "Antarctica/Davis" },
                  {
                    label: "Antarctica/DumontDUrville",
                    value: "Antarctica/DumontDUrville",
                  },
                  {
                    label: "Antarctica/Macquarie",
                    value: "Antarctica/Macquarie",
                  },
                  { label: "Antarctica/Mawson", value: "Antarctica/Mawson" },
                  { label: "Antarctica/McMurdo", value: "Antarctica/McMurdo" },
                  { label: "Antarctica/Palmer", value: "Antarctica/Palmer" },
                  { label: "Antarctica/Rothera", value: "Antarctica/Rothera" },
                  { label: "Antarctica/Syowa", value: "Antarctica/Syowa" },
                  { label: "Antarctica/Troll", value: "Antarctica/Troll" },
                  { label: "Antarctica/Vostok", value: "Antarctica/Vostok" },
                  {
                    label: "Arctic/Longyearbyen",
                    value: "Arctic/Longyearbyen",
                  },
                  { label: "Asia/Aden", value: "Asia/Aden" },
                  { label: "Asia/Almaty", value: "Asia/Almaty" },
                  { label: "Asia/Amman", value: "Asia/Amman" },
                  { label: "Asia/Anadyr", value: "Asia/Anadyr" },
                  { label: "Asia/Aqtau", value: "Asia/Aqtau" },
                  { label: "Asia/Aqtobe", value: "Asia/Aqtobe" },
                  { label: "Asia/Ashgabat", value: "Asia/Ashgabat" },
                  { label: "Asia/Atyrau", value: "Asia/Atyrau" },
                  { label: "Asia/Baghdad", value: "Asia/Baghdad" },
                  { label: "Asia/Bahrain", value: "Asia/Bahrain" },
                  { label: "Asia/Baku", value: "Asia/Baku" },
                  { label: "Asia/Bangkok", value: "Asia/Bangkok" },
                  { label: "Asia/Barnaul", value: "Asia/Barnaul" },
                  { label: "Asia/Beirut", value: "Asia/Beirut" },
                  { label: "Asia/Bishkek", value: "Asia/Bishkek" },
                  { label: "Asia/Brunei", value: "Asia/Brunei" },
                  { label: "Asia/Calcutta", value: "Asia/Calcutta" },
                  { label: "Asia/Chita", value: "Asia/Chita" },
                  { label: "Asia/Choibalsan", value: "Asia/Choibalsan" },
                  { label: "Asia/Colombo", value: "Asia/Colombo" },
                  { label: "Asia/Damascus", value: "Asia/Damascus" },
                  { label: "Asia/Dhaka", value: "Asia/Dhaka" },
                  { label: "Asia/Dili", value: "Asia/Dili" },
                  { label: "Asia/Dubai", value: "Asia/Dubai" },
                  { label: "Asia/Dushanbe", value: "Asia/Dushanbe" },
                  { label: "Asia/Famagusta", value: "Asia/Famagusta" },
                  { label: "Asia/Gaza", value: "Asia/Gaza" },
                  { label: "Asia/Hebron", value: "Asia/Hebron" },
                  { label: "Asia/Hong_Kong", value: "Asia/Hong_Kong" },
                  { label: "Asia/Hovd", value: "Asia/Hovd" },
                  { label: "Asia/Irkutsk", value: "Asia/Irkutsk" },
                  { label: "Asia/Jakarta", value: "Asia/Jakarta" },
                  { label: "Asia/Jayapura", value: "Asia/Jayapura" },
                  { label: "Asia/Jerusalem", value: "Asia/Jerusalem" },
                  { label: "Asia/Kabul", value: "Asia/Kabul" },
                  { label: "Asia/Kamchatka", value: "Asia/Kamchatka" },
                  { label: "Asia/Karachi", value: "Asia/Karachi" },
                  { label: "Asia/Katmandu", value: "Asia/Katmandu" },
                  { label: "Asia/Khandyga", value: "Asia/Khandyga" },
                  { label: "Asia/Krasnoyarsk", value: "Asia/Krasnoyarsk" },
                  { label: "Asia/Kuala_Lumpur", value: "Asia/Kuala_Lumpur" },
                  { label: "Asia/Kuching", value: "Asia/Kuching" },
                  { label: "Asia/Kuwait", value: "Asia/Kuwait" },
                  { label: "Asia/Macau", value: "Asia/Macau" },
                  { label: "Asia/Magadan", value: "Asia/Magadan" },
                  { label: "Asia/Makassar", value: "Asia/Makassar" },
                  { label: "Asia/Manila", value: "Asia/Manila" },
                  { label: "Asia/Muscat", value: "Asia/Muscat" },
                  { label: "Asia/Nicosia", value: "Asia/Nicosia" },
                  { label: "Asia/Novokuznetsk", value: "Asia/Novokuznetsk" },
                  { label: "Asia/Novosibirsk", value: "Asia/Novosibirsk" },
                  { label: "Asia/Omsk", value: "Asia/Omsk" },
                  { label: "Asia/Oral", value: "Asia/Oral" },
                  { label: "Asia/Phnom_Penh", value: "Asia/Phnom_Penh" },
                  { label: "Asia/Pontianak", value: "Asia/Pontianak" },
                  { label: "Asia/Pyongyang", value: "Asia/Pyongyang" },
                  { label: "Asia/Qatar", value: "Asia/Qatar" },
                  { label: "Asia/Qostanay", value: "Asia/Qostanay" },
                  { label: "Asia/Qyzylorda", value: "Asia/Qyzylorda" },
                  { label: "Asia/Rangoon", value: "Asia/Rangoon" },
                  { label: "Asia/Riyadh", value: "Asia/Riyadh" },
                  { label: "Asia/Saigon", value: "Asia/Saigon" },
                  { label: "Asia/Sakhalin", value: "Asia/Sakhalin" },
                  { label: "Asia/Samarkand", value: "Asia/Samarkand" },
                  { label: "Asia/Seoul", value: "Asia/Seoul" },
                  { label: "Asia/Shanghai", value: "Asia/Shanghai" },
                  { label: "Asia/Singapore", value: "Asia/Singapore" },
                  { label: "Asia/Srednekolymsk", value: "Asia/Srednekolymsk" },
                  { label: "Asia/Taipei", value: "Asia/Taipei" },
                  { label: "Asia/Tashkent", value: "Asia/Tashkent" },
                  { label: "Asia/Tbilisi", value: "Asia/Tbilisi" },
                  { label: "Asia/Tehran", value: "Asia/Tehran" },
                  { label: "Asia/Thimphu", value: "Asia/Thimphu" },
                  { label: "Asia/Tokyo", value: "Asia/Tokyo" },
                  { label: "Asia/Tomsk", value: "Asia/Tomsk" },
                  { label: "Asia/Ulaanbaatar", value: "Asia/Ulaanbaatar" },
                  { label: "Asia/Urumqi", value: "Asia/Urumqi" },
                  { label: "Asia/Ust-Nera", value: "Asia/Ust-Nera" },
                  { label: "Asia/Vientiane", value: "Asia/Vientiane" },
                  { label: "Asia/Vladivostok", value: "Asia/Vladivostok" },
                  { label: "Asia/Yakutsk", value: "Asia/Yakutsk" },
                  { label: "Asia/Yekaterinburg", value: "Asia/Yekaterinburg" },
                  { label: "Asia/Yerevan", value: "Asia/Yerevan" },
                  { label: "Atlantic/Azores", value: "Atlantic/Azores" },
                  { label: "Atlantic/Bermuda", value: "Atlantic/Bermuda" },
                  { label: "Atlantic/Canary", value: "Atlantic/Canary" },
                  {
                    label: "Atlantic/Cape_Verde",
                    value: "Atlantic/Cape_Verde",
                  },
                  { label: "Atlantic/Faeroe", value: "Atlantic/Faeroe" },
                  { label: "Atlantic/Madeira", value: "Atlantic/Madeira" },
                  { label: "Atlantic/Reykjavik", value: "Atlantic/Reykjavik" },
                  {
                    label: "Atlantic/South_Georgia",
                    value: "Atlantic/South_Georgia",
                  },
                  { label: "Atlantic/St_Helena", value: "Atlantic/St_Helena" },
                  { label: "Atlantic/Stanley", value: "Atlantic/Stanley" },
                  { label: "Australia/Adelaide", value: "Australia/Adelaide" },
                  { label: "Australia/Brisbane", value: "Australia/Brisbane" },
                  {
                    label: "Australia/Broken_Hill",
                    value: "Australia/Broken_Hill",
                  },
                  { label: "Australia/Currie", value: "Australia/Currie" },
                  { label: "Australia/Darwin", value: "Australia/Darwin" },
                  { label: "Australia/Eucla", value: "Australia/Eucla" },
                  { label: "Australia/Hobart", value: "Australia/Hobart" },
                  { label: "Australia/Lindeman", value: "Australia/Lindeman" },
                  {
                    label: "Australia/Lord_Howe",
                    value: "Australia/Lord_Howe",
                  },
                  {
                    label: "Australia/Melbourne",
                    value: "Australia/Melbourne",
                  },
                  { label: "Australia/Perth", value: "Australia/Perth" },
                  { label: "Australia/Sydney", value: "Australia/Sydney" },
                  { label: "Europe/Amsterdam", value: "Europe/Amsterdam" },
                  { label: "Europe/Andorra", value: "Europe/Andorra" },
                  { label: "Europe/Astrakhan", value: "Europe/Astrakhan" },
                  { label: "Europe/Athens", value: "Europe/Athens" },
                  { label: "Europe/Belgrade", value: "Europe/Belgrade" },
                  { label: "Europe/Berlin", value: "Europe/Berlin" },
                  { label: "Europe/Bratislava", value: "Europe/Bratislava" },
                  { label: "Europe/Brussels", value: "Europe/Brussels" },
                  { label: "Europe/Bucharest", value: "Europe/Bucharest" },
                  { label: "Europe/Budapest", value: "Europe/Budapest" },
                  { label: "Europe/Busingen", value: "Europe/Busingen" },
                  { label: "Europe/Chisinau", value: "Europe/Chisinau" },
                  { label: "Europe/Copenhagen", value: "Europe/Copenhagen" },
                  { label: "Europe/Dublin", value: "Europe/Dublin" },
                  { label: "Europe/Gibraltar", value: "Europe/Gibraltar" },
                  { label: "Europe/Guernsey", value: "Europe/Guernsey" },
                  { label: "Europe/Helsinki", value: "Europe/Helsinki" },
                  { label: "Europe/Isle_of_Man", value: "Europe/Isle_of_Man" },
                  { label: "Europe/Istanbul", value: "Europe/Istanbul" },
                  { label: "Europe/Jersey", value: "Europe/Jersey" },
                  { label: "Europe/Kaliningrad", value: "Europe/Kaliningrad" },
                  { label: "Europe/Kyiv", value: "Europe/Kiev" },
                  { label: "Europe/Kirov", value: "Europe/Kirov" },
                  { label: "Europe/Lisbon", value: "Europe/Lisbon" },
                  { label: "Europe/Ljubljana", value: "Europe/Ljubljana" },
                  { label: "Europe/London", value: "Europe/London" },
                  { label: "Europe/Luxembourg", value: "Europe/Luxembourg" },
                  { label: "Europe/Madrid", value: "Europe/Madrid" },
                  { label: "Europe/Malta", value: "Europe/Malta" },
                  { label: "Europe/Mariehamn", value: "Europe/Mariehamn" },
                  { label: "Europe/Minsk", value: "Europe/Minsk" },
                  { label: "Europe/Monaco", value: "Europe/Monaco" },
                  { label: "Europe/Moscow", value: "Europe/Moscow" },
                  { label: "Europe/Oslo", value: "Europe/Oslo" },
                  { label: "Europe/Paris", value: "Europe/Paris" },
                  { label: "Europe/Podgorica", value: "Europe/Podgorica" },
                  { label: "Europe/Prague", value: "Europe/Prague" },
                  { label: "Europe/Riga", value: "Europe/Riga" },
                  { label: "Europe/Rome", value: "Europe/Rome" },
                  { label: "Europe/Samara", value: "Europe/Samara" },
                  { label: "Europe/San_Marino", value: "Europe/San_Marino" },
                  { label: "Europe/Sarajevo", value: "Europe/Sarajevo" },
                  { label: "Europe/Saratov", value: "Europe/Saratov" },
                  { label: "Europe/Simferopol", value: "Europe/Simferopol" },
                  { label: "Europe/Skopje", value: "Europe/Skopje" },
                  { label: "Europe/Sofia", value: "Europe/Sofia" },
                  { label: "Europe/Stockholm", value: "Europe/Stockholm" },
                  { label: "Europe/Tallinn", value: "Europe/Tallinn" },
                  { label: "Europe/Tirane", value: "Europe/Tirane" },
                  { label: "Europe/Ulyanovsk", value: "Europe/Ulyanovsk" },
                  { label: "Europe/Uzhgorod", value: "Europe/Uzhgorod" },
                  { label: "Europe/Vaduz", value: "Europe/Vaduz" },
                  { label: "Europe/Vatican", value: "Europe/Vatican" },
                  { label: "Europe/Vienna", value: "Europe/Vienna" },
                  { label: "Europe/Vilnius", value: "Europe/Vilnius" },
                  { label: "Europe/Volgograd", value: "Europe/Volgograd" },
                  { label: "Europe/Warsaw", value: "Europe/Warsaw" },
                  { label: "Europe/Zagreb", value: "Europe/Zagreb" },
                  { label: "Europe/Zaporozhye", value: "Europe/Zaporozhye" },
                  { label: "Europe/Zurich", value: "Europe/Zurich" },
                  {
                    label: "Indian/Antananarivo",
                    value: "Indian/Antananarivo",
                  },
                  { label: "Indian/Chagos", value: "Indian/Chagos" },
                  { label: "Indian/Christmas", value: "Indian/Christmas" },
                  { label: "Indian/Cocos", value: "Indian/Cocos" },
                  { label: "Indian/Comoro", value: "Indian/Comoro" },
                  { label: "Indian/Kerguelen", value: "Indian/Kerguelen" },
                  { label: "Indian/Mahe", value: "Indian/Mahe" },
                  { label: "Indian/Maldives", value: "Indian/Maldives" },
                  { label: "Indian/Mauritius", value: "Indian/Mauritius" },
                  { label: "Indian/Mayotte", value: "Indian/Mayotte" },
                  { label: "Indian/Reunion", value: "Indian/Reunion" },
                  { label: "Pacific/Apia", value: "Pacific/Apia" },
                  { label: "Pacific/Auckland", value: "Pacific/Auckland" },
                  {
                    label: "Pacific/Bougainville",
                    value: "Pacific/Bougainville",
                  },
                  { label: "Pacific/Chatham", value: "Pacific/Chatham" },
                  { label: "Pacific/Easter", value: "Pacific/Easter" },
                  { label: "Pacific/Efate", value: "Pacific/Efate" },
                  { label: "Pacific/Enderbury", value: "Pacific/Enderbury" },
                  { label: "Pacific/Fakaofo", value: "Pacific/Fakaofo" },
                  { label: "Pacific/Fiji", value: "Pacific/Fiji" },
                  { label: "Pacific/Funafuti", value: "Pacific/Funafuti" },
                  { label: "Pacific/Galapagos", value: "Pacific/Galapagos" },
                  { label: "Pacific/Gambier", value: "Pacific/Gambier" },
                  {
                    label: "Pacific/Guadalcanal",
                    value: "Pacific/Guadalcanal",
                  },
                  { label: "Pacific/Guam", value: "Pacific/Guam" },
                  { label: "Pacific/Honolulu", value: "Pacific/Honolulu" },
                  { label: "Pacific/Johnston", value: "Pacific/Johnston" },
                  { label: "Pacific/Kiritimati", value: "Pacific/Kiritimati" },
                  { label: "Pacific/Kosrae", value: "Pacific/Kosrae" },
                  { label: "Pacific/Kwajalein", value: "Pacific/Kwajalein" },
                  { label: "Pacific/Majuro", value: "Pacific/Majuro" },
                  { label: "Pacific/Marquesas", value: "Pacific/Marquesas" },
                  { label: "Pacific/Midway", value: "Pacific/Midway" },
                  { label: "Pacific/Nauru", value: "Pacific/Nauru" },
                  { label: "Pacific/Niue", value: "Pacific/Niue" },
                  { label: "Pacific/Norfolk", value: "Pacific/Norfolk" },
                  { label: "Pacific/Noumea", value: "Pacific/Noumea" },
                  { label: "Pacific/Pago_Pago", value: "Pacific/Pago_Pago" },
                  { label: "Pacific/Palau", value: "Pacific/Palau" },
                  { label: "Pacific/Pitcairn", value: "Pacific/Pitcairn" },
                  { label: "Pacific/Ponape", value: "Pacific/Ponape" },
                  {
                    label: "Pacific/Port_Moresby",
                    value: "Pacific/Port_Moresby",
                  },
                  { label: "Pacific/Rarotonga", value: "Pacific/Rarotonga" },
                  { label: "Pacific/Saipan", value: "Pacific/Saipan" },
                  { label: "Pacific/Tahiti", value: "Pacific/Tahiti" },
                  { label: "Pacific/Tarawa", value: "Pacific/Tarawa" },
                  { label: "Pacific/Tongatapu", value: "Pacific/Tongatapu" },
                  { label: "Pacific/Truk", value: "Pacific/Truk" },
                  { label: "Pacific/Wake", value: "Pacific/Wake" },
                  { label: "Pacific/Wallis", value: "Pacific/Wallis" },
                ],
                onChange: onChangeTimeZone,
              }),
              el(
                Button,
                {
                  variant: "secondary",
                  onMouseDown: preventComboboxMouseBlur,
                  onClick: (event) => {
                    event.currentTarget.focus();
                    props.setAttributes({
                      timeZone: browserTz,
                    });
                  },
                  style: { marginTop: "0.5rem" },
                },
                i18n["resetToSiteTz"] || "Auto Timezone"
              ),
              el(Divider, { style: { margin: "1rem 0" } }),
              el(LocaleControl, {
                value: props.attributes.locale,
                onChange: onChangeLocale,
              }),
              el(Divider, { style: { margin: "1rem 0" } }),
              el(ToggleControl, {
                ...nextUI,
                label: i18n["amPm"] || "24-Hour",
                checked: props.attributes.period,
                onChange: onChangePeriod,
              }),
              el(ToggleControl, {
                ...nextUI,
                label: i18n["second"] || "Second",
                checked: props.attributes.second,
                onChange: onChangeSecond,
              }),
              el(ToggleControl, {
                ...nextUI,
                label: i18n["hundredths"] || "Hundredths of a second",
                help:
                  i18n["hundredthsHelp"] || "Show two digits after seconds.",
                checked: props.attributes.hundredths,
                onChange: onChangeHundredths,
              }),
              el(ToggleControl, {
                ...nextUI,
                label: i18n["date"] || "Date",
                checked: props.attributes.date,
                onChange: onChangeDate,
              }),
            ]
          ),
          el(
            PanelBody,
            { title: i18n["display"] || "Display", initialOpen: false },
            [
              el(SelectControl, {
                ...nextUI,

                label: i18n["googleFonts"] || "Google Fonts",
                help:
                  i18n["googleFontsHelp"] ||
                  "Google fonts are loading from the CDN, they are not included in the plugin.",
                value: props.attributes.fontFamily,
                options: [
                  { label: "System", value: "" },
                  { label: "Sono", value: "Sono" },
                  { label: "Roboto Mono", value: "Roboto Mono" },
                  { label: "Sometype Mono", value: "Sometype Mono" },
                  { label: "Inconsolata", value: "Inconsolata" },
                  { label: "Source Code Pro", value: "Source Code Pro" },
                  { label: "IBM Plex Mono", value: "IBM Plex Mono" },
                  { label: "Space Mono", value: "Space Mono" },
                  { label: "Ubuntu Mono", value: "Ubuntu Mono" },
                  {
                    label: "Nanum Gothic Coding",
                    value: "Nanum Gothic Coding",
                  },
                  { label: "Courier Prime", value: "Courier Prime" },
                  { label: "JetBrains Mono", value: "JetBrains Mono" },
                  { label: "Fira Mono", value: "Fira Mono" },
                  { label: "Cousine", value: "Cousine" },
                  { label: "Anonymous Pro", value: "Anonymous Pro" },
                  { label: "Noto Sans Mono", value: "Noto Sans Mono" },
                  { label: "Fira Code", value: "Fira Code" },
                  { label: "Overpass Mono", value: "Overpass Mono" },
                  { label: "B612 Mono", value: "B612 Mono" },
                  { label: "Victor Mono", value: "Victor Mono" },
                  { label: "Chivo Mono", value: "Chivo Mono" },
                  { label: "Azeret Mono", value: "Azeret Mono" },
                  { label: "Martian Mono", value: "Martian Mono" },
                  { label: "Red Hat Mono", value: "Red Hat Mono" },
                  { label: "Spline Sans Mono", value: "Spline Sans Mono" },
                ],
                onChange: onChangeFontFamily,
              }),
            ]
          ),
          el(
            PanelBody,
            { title: i18n["about"] || "About", initialOpen: true },
            [
              el(
                ExternalLink,
                {
                  href: "https://utctime.info/",
                  target: "_blank",
                  style: { textDecoration: "none" },
                },
                i18n["timeNow"] || "Time Now"
              ),
              el(Divider, { style: { margin: "1rem 0" } }),
              el(
                ExternalLink,
                {
                  href: "https://todaysdatenow.com/",
                  target: "_blank",
                  style: { textDecoration: "none" },
                },
                i18n["todaysDateNow"] || "Todays Date"
              ),
              el(Divider, { style: { margin: "1rem 0" } }),
              el(
                ExternalLink,
                {
                  href: "https://wordpress.org/support/plugin/simple-digital-clock/reviews/#new-post",
                  target: "_blank",
                  style: { textDecoration: "none" },
                },
                i18n["ratePlugin"] || "❤️ Rate Plugin ★★★★★"
              ),
              el(Divider, { style: { margin: "1rem 0" } }),
              el(
                ExternalLink,
                {
                  href: "https://codepen.io/dejurin/pen/KKJZWjV",
                  target: "_blank",
                  style: { textDecoration: "none" },
                },
                i18n["demoPlugin"] || "DEMO 👀"
              ),
            ]
          )
        ),
        el(
          "div",
          blockProps,
          el("timenow-zone-sdcw", {
            style: { pointerEvents: "none" },
            width,
            locale,
            rounded,
            align,
            ...(shadow && shadow !== "" ? { shadow } : {}),
            ...(date && { date: "true" }),
            ...(second && { second: "true" }),
            ...(hundredths && { hundredths: "true" }),
            ...(border && { border: "true" }),
            ...(period && { period: "false" }),
            ...(caption && caption !== "" ? { caption } : {}),
            ...(background && background !== "" ? { background } : {}),
            ...(timeZone && timeZone !== "" ? { "time-zone": timeZone } : {}),
            ...(fontFamily && fontFamily !== ""
              ? { "font-family": fontFamily }
              : {}),
            ...(backgroundColor && backgroundColor !== ""
              ? { "background-color": backgroundColor }
              : {}),
          })
        ),
      ];
    },
    save: function (props) {
      var align = props.attributes.align;
      var width = props.attributes.width;
      var period = props.attributes.period;
      var caption = props.attributes.caption;
      var date = props.attributes.date;
      var second = props.attributes.second;
      var hundredths = props.attributes.hundredths;
      var rounded = props.attributes.rounded;
      var timeZone = props.attributes.timeZone;
      var backgroundColor = props.attributes.backgroundColor;
      var background = props.attributes.background;
      var border = props.attributes.border;
      var locale = props.attributes.locale;
      var fontFamily = props.attributes.fontFamily;
      var shadow = props.attributes.shadow;

      return el("timenow-zone-sdcw", {
        ...editor.useBlockProps.save(),
        width,
        locale,
        rounded,
        align,
        ...(shadow && shadow !== "" ? { shadow } : {}),
        ...(date && { date: "true" }),
        ...(second && { second: "true" }),
        ...(hundredths && { hundredths: "true" }),
        ...(border && { border: "true" }),
        ...(period && { period: "false" }),
        ...(caption && caption !== "" ? { caption } : {}),
        ...(background && background !== "" ? { background } : {}),
        ...(timeZone && timeZone !== "" ? { "time-zone": timeZone } : {}),
        ...(fontFamily && fontFamily !== ""
          ? { "font-family": fontFamily }
          : {}),
        ...(backgroundColor && backgroundColor !== ""
          ? { "background-color": backgroundColor }
          : {}),
      });
    },
  });
})(
  window.wp.blocks,
  window.wp.blockEditor,
  window.wp.element,
  window.wp.components,
  window.wp.hooks
);
