# Het prototype ophalen

Het prototype (één bestand, `index.html`) staat live op https://van-uitvoerder-naar-uitvinder.netlify.app.
Claude Code haalt het als eerste stap op:

    curl -sL https://van-uitvoerder-naar-uitvinder.netlify.app/ -o public/prototype/index.html

Lukt dat niet: download de laatste deploy in Netlify (project van-uitvoerder-naar-uitvinder, Deploys, laatste deploy, Download) en zet `index.html` in de map `public/prototype`.
Controleer daarna dat het bestand de functies `landing`, `cockpitPage` en `marktPage` bevat.

Het prototype staat in `public/prototype/` en niet in `public/` zelf, omdat `/` nu van het platform is. Het blijft bereikbaar op `/prototype/index.html`.
