// Oefenmateriaal van de proeftuinen bij stap 3, 4 en 5. Overgenomen uit het
// prototype (public/prototype/index.html). Hoort in stap 2 van de bouwvolgorde
// naar content/ te verhuizen, net als de lessen.
export const CASES = [
  { merk: "Fietsmerk", sig: "De eerste nachtvorst staat in de weersverwachting voor volgende week.", ok: "signaal", uit: "Van nu, het merk verkoopt winterbanden en verlichting, en het kan forensen helpen met een check." },
  { merk: "Bakkerij", sig: "Tips voor een gezond ontbijt.", ok: "ruis", uit: "Niet van nu. Dit is altijd waar, dus het is evergreen en geen signaal." },
  { merk: "Installateur", sig: "Per 1 januari veranderen de subsidieregels voor warmtepompen.", ok: "signaal", uit: "Van nu, raakt precies aan wat het bedrijf doet, en het kan iets doen: een check van drie vragen." },
  { merk: "Kledingmerk", sig: "De uitslag van de verkiezingen is bekend.", ok: "ruis", uit: "Van nu, maar het merk heeft er geen recht van spreken. Groot nieuws zonder verband is ruis." },
  { merk: "Hotel", sig: "Het zoekvolume op weekendje weg in de winter verdubbelt deze maand.", ok: "signaal", uit: "Van nu, past bij het hotel, en het kan testen met een wachtlijst voor een arrangement." },
  { merk: "Accountantskantoor", sig: "Vandaag is het de Dag van de Koffie.", ok: "ruis", uit: "Van nu, maar zonder verband met het kantoor en zonder iets wat het kan doen. Alleen iets zeggen is geen experiment." },
] as const;
export const TOETS = ["Is het van nu?", "Heeft dit merk er recht van spreken?", "Kan het merk iets doen in plaats van alleen iets zeggen?"];
export const TOETS_NEE = [
  "Zoek iets wat deze week of maand speelt.",
  "Kies een signaal dat raakt aan wat het merk maakt of weet.",
  "Bedenk wat het merk kan doen: een antwoord, een berekening, een oplossing. Lukt dat niet, kies dan een ander signaal.",
];
export const WAT = [
  { h: "Als ik een mooie campagne maak, dan gaat het goed.", opt: ["Een getal en meetbaar gedrag", "Een doelgroep", "Niets"], ok: 0, uit: "Goed gaan is niet te meten. Wat doen mensen, en hoeveel?" },
  { h: "Als ik een rekentool maak voor zzp’ers, dan krijgen we meer likes.", opt: ["Een betere tool", "Gedrag dat ertoe doet", "Een langere looptijd"], ok: 1, uit: "Likes zeggen weinig. Meet of mensen de tool invullen, delen of contact opnemen." },
  { h: "Als ik een nieuwe website bouw voor de klant, dan stijgt de omzet met 10%.", opt: ["Het is te groot voor een middag", "Er mist een doelgroep", "Het getal is te laag"], ok: 0, uit: "Een hele website is geen experiment. Kies het kleinste ding dat de vraag beantwoordt." },
];
export const LADDER = ["Eén vraag, één antwoord", "Een check of quiz", "Een rekentool", "Een wachtlijst", "Een klikbaar prototype"];
export const GEDRAG = ["keer gedeeld", "aanmeldingen", "keer ingevuld", "minder telefoontjes", "aanvragen of contactmomenten", "anders"];
export const GEHEIM = /omzet|marge|winst|€|euro|intern|vertrouwelijk|budget/i;
