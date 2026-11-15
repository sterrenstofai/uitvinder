// Het deelbeeld van de Rolscan: een afbeelding van 1080 bij 1350, in de browser getekend.
type R = { uitvindend: number; kort?: string; experiment?: { bouw?: string } };

function wrap(c: CanvasRenderingContext2D, t: string, x: number, y: number, max: number, lh: number, regels: number) {
  let l = "", n = 0;
  for (const word of String(t).split(" ")) {
    const test = l ? l + " " + word : word;
    if (c.measureText(test).width > max && l) {
      n++;
      if (n === regels) { c.fillText(l + "…", x, y); return; }
      c.fillText(l, x, y); l = word; y += lh;
    } else l = test;
  }
  if (l) c.fillText(l, x, y);
}

export async function deelbeeld(r: R, eerste: boolean) {
  await document.fonts.ready;
  const c = document.createElement("canvas");
  c.width = 1080; c.height = 1350;
  const g = c.getContext("2d");
  if (!g) return;
  const F = '"Neue Montreal", "Inter", sans-serif';
  const pct = Math.round(r.uitvindend);
  g.fillStyle = "#f6e6da"; g.fillRect(0, 0, 1080, 1350);
  g.filter = "blur(140px)";
  for (const [col, x, y, rad] of [["#ff8a5c", 180, 1250, 520], ["#a98bff", 930, 300, 440], ["#f59ac0", 560, 700, 300], ["#ffffff", 540, -60, 420]] as const) {
    g.fillStyle = col; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
  g.filter = "none";
  g.fillStyle = "#141413"; g.font = `500 34px ${F}`; g.fillText(eerste ? "Mijn nulmeting" : "Mijn meting", 90, 150);
  g.font = `500 260px ${F}`; g.fillText(pct + "%", 72, 400);
  g.font = `500 104px ${F}`; g.fillText("uitvinder.", 90, 520);
  g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.roundRect(90, 590, 900, 16, 8); g.fill();
  g.fillStyle = "#141413"; g.beginPath(); g.roundRect(90, 590, Math.max(16, (900 * pct) / 100), 16, 8); g.fill();
  g.font = `500 34px ${F}`; g.fillText("Volgende week test ik", 90, 730);
  g.font = `500 60px ${F}`; wrap(g, r.kort || r.experiment?.bouw || "", 90, 810, 900, 72, 5);
  g.font = `600 44px ${F}`; g.fillText("Uitvinder", 90, 1210);
  g.font = `400 30px ${F}`; g.fillStyle = "#3d3a36"; g.fillText("Van uitvoerder naar uitvinder, door Thijs Mensink", 90, 1260);
  c.toBlob((b) => {
    if (!b) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = eerste ? "mijn-nulmeting.png" : "mijn-meting.png";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, "image/png");
}
