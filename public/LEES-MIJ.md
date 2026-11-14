# public/index.html ophalen

Het prototype (één bestand, `index.html`) staat live op https://van-uitvoerder-naar-uitvinder.netlify.app.
Claude Code haalt het als eerste stap op:

    curl -sL https://van-uitvoerder-naar-uitvinder.netlify.app/ -o public/index.html

Lukt dat niet: download de laatste deploy in Netlify (project van-uitvoerder-naar-uitvinder, Deploys, laatste deploy, Download) en zet `index.html` in deze map.
Controleer daarna dat het bestand de functies `landing`, `cockpitPage` en `marktPage` bevat.
