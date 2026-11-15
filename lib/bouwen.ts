// De vijf stappen van de bouwmodule en de proeftuin, overgenomen uit het prototype.
export const BOUW: [string, string, string[]][] = [
  ["De vraag scherp", "Een tool beantwoordt één vraag die veel mensen hebben. Schrijf de vraag op zoals de doelgroep hem zou typen in Google. Lukt dat niet in één zin, dan is het nog geen tool.", ["De vraag past in één zin", "Je kent iemand die deze vraag deze week had"]],
  ["De spec", "Voordat je iets bouwt, schrijf je op wat het moet doen en wat niet. Hoe scherper de spec, hoe beter de AI bouwt. Gebruik de spec-maker hieronder, en lees hem daarna kritisch: klopt dit met wat je bedoelt?", ["Doel, voor wie, stappen, grenzen en klaar-als staan erin", "Hij past op één scherm"]],
  ["Bouwen", "Plak je spec in Claude en vraag om één HTML-bestand dat alles bevat. Klopt iets niet, beschrijf dan wat je ziet en wat je verwachtte, één ding tegelijk.", ["Het werkt op je telefoon", "Je hebt elke verandering zelf gecontroleerd"]],
  ["Testen", "Laat drie mensen uit de doelgroep het gebruiken zonder uitleg. Kijk mee en schrijf op waar ze vastlopen. Dat zijn je verbeteringen.", ["Drie mensen hebben het gebruikt", "Je weet waar ze vastliepen, en hebt het verbeterd"]],
  ["Live zetten", "Sleep je bestand naar Netlify Drop en je hebt een link. Deel hem met je klant of je team. Pas dan weet je of het werkt.", ["Er is een link", "Je weet hoe je gaat meten of het werkt"]],
];
export const SPECW = [
  { s: "Maak een mooie tool voor onze klanten over energie.", opt: ["Voor wie, en welke vraag", "Een kleurenpalet", "Niets"], ok: 0, uit: "Zonder doelgroep en één concrete vraag bouwt de AI iets algemeens, en dat gebruikt niemand." },
  { s: "Doel: forensen laten zien wat hun auto per maand kost. Wat het doet: invullen en een uitkomst tonen.", opt: ["Wat het niet doet, en wanneer het klaar is", "Meer bijvoeglijke naamwoorden", "Een langere titel"], ok: 0, uit: "Zonder grenzen bouwt de AI te veel. Zonder klaar-als weet je niet wanneer je moet stoppen." },
  { s: "Doel: laten zien of je subsidie krijgt. Voor wie: huiseigenaren. Wat het doet: 1. drie vragen, 2. een uitkomst met uitleg. Wat het niet doet: geen account, geen opslag. Klaar als: werkt op mobiel en laadt snel.", opt: ["Niets wezenlijks, deze is bruikbaar", "Een logo", "Een database"], ok: 0, uit: "Kort, maar compleet: doel, doelgroep, stappen, grenzen en klaar-als." },
];
