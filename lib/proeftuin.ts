// Oefenmateriaal van de proeftuinen bij stap 3, 4 en 5. Overgenomen uit het
// prototype (public/prototype/index.html). Hoort in stap 2 van de bouwvolgorde
// naar content/ te verhuizen, net als de lessen.
// De merken zijn voorbeelden, de situaties zijn bedacht.
export const CASES = [
  { merk: "Coolblue", sig: "De eerste hittegolf van het jaar staat in de weersverwachting voor volgende week.", ok: "signaal", uit: "Van nu, Coolblue verkoopt airco's en ventilatoren, en het kan mensen helpen met een keuzehulp." },
  { merk: "Albert Heijn", sig: "Tips voor een gezond ontbijt.", ok: "ruis", uit: "Niet van nu. Dit is altijd waar, dus het is evergreen en geen signaal." },
  { merk: "Bol", sig: "Over drie weken begint het nieuwe schooljaar.", ok: "signaal", uit: "Van nu, Bol verkoopt schoolspullen, en het kan iets doen: een lijst per leerjaar." },
  { merk: "HEMA", sig: "De uitslag van de verkiezingen is bekend.", ok: "ruis", uit: "Van nu, maar het merk heeft er geen recht van spreken. Groot nieuws zonder verband is ruis." },
  { merk: "HEMA", sig: "Sinterklaas komt over twee weken aan in Nederland.", ok: "signaal", uit: "Van nu, HEMA verkoopt cadeautjes en chocoladeletters, en het kan helpen met een surprisehulp." },
  { merk: "Coolblue", sig: "Vandaag is het Nationale Tulpendag.", ok: "ruis", uit: "Van nu, maar zonder verband met Coolblue en zonder iets wat het kan doen. Alleen iets zeggen is geen experiment." },
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
export const ZINNEN = [
  { z: "Ik ben een creatieve designer met passie voor merken.", ok: "inwisselbaar", uit: "Functietitel en bijvoeglijke naamwoorden. Elke designer kan deze zin gebruiken." },
  { z: "Ik schrijf voor zorgmerken alsof ik nog aan het bed sta, omdat ik zes jaar verpleegkundige was.", ok: "eigen", uit: "Concreet, waar en te bewijzen. Weinig copywriters kunnen dit zeggen." },
  { z: "Ik help bedrijven groeien met slimme marketing.", ok: "inwisselbaar", uit: "Te breed: voor wie, en wat is slim? Niets van buiten het vak." },
  { z: "Ik maak campagnes voor bouwbedrijven die vakmensen serieus nemen, omdat ik zelf vijf jaar timmerman was.", ok: "eigen", uit: "Duidelijke doelgroep en een geschiedenis die anderen niet hebben." },
  { z: "Ik ben een verbinder die out of the box denkt.", ok: "inwisselbaar", uit: "Alleen vage woorden. Niemand kan controleren of het klopt." },
] as const;
export const VAAG = /\b(creatie\w*|passie\w*|gepassioneerd\w*|innovatie\w*|uniek\w*|verbinder|out of the box|enthousiast\w*|holistisch\w*|gedreven|slim\w*)\b/i;
