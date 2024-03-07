# 🗺️ Mapster
## Interaktivní železniční mapa od ENETu pro SŽ
> Projekt je v aktivním vývoji a stále přibývá nová funkcionalita.

<br><br>

## Příprava spuštění aplikace
```console
npm install
npm run php-deps
```

> Poznámka: Připojení k databázi vyžaduje instalaci a povolení rozšíření `pdo_pgsql` v `php.ini`

## Spuštění
```console
npm run build   # Kompilace
npm run host    # Spuštění interaktivního dev serveru
```

## Snímky obrazovky

<div align="center">
    <img src = "screenshots/map_ui.png">
</div>
<div align="center">
    Mapové UI
</div>
<br>

<div align="center">
    <img src = "screenshots/layer_list.png">
</div>
<div align="center">
    List vrstev
</div>
<br>

<div align="center">
    <img src = "screenshots/layer_builder.png">
</div>
<div align="center">
    Sestavení nové vrstvy z databázového katalogu
</div>
<br>

***
<br>

<div align="center">
    <img id="orgunit-content" src="https://www.vsb.cz/share/webresources/logos/email/origin/9370_cs.png" alt="VŠB-TUO, 9390, Centrum energetických jednotek pro využití netradičních zdrojů energie " height="50">
    <div align="center">
        &copy; Jan Němec 🤝 CENET VŠB-TUO - 2024
    </div>
</div>
