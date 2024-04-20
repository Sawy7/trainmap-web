# 🗺️ Mapster
## Interaktivní železniční mapa od ENETu pro SŽ
> Projekt je v aktivním vývoji a stále přibývá nová funkcionalita. Toto je hlavní repositář a ty přidružené jsou vloženy jako [submoduly](submodules/).

## Nastavení celého stacku pomocí Dockeru
> Proces naplnění databáze, který probíhá stažením a konverzí původních zdrojů, je **velmi náročný**: spotřebuje desítky až stovky gigabajtů dat (velmi podrobný výškopis) a patrně bude trvat několik hodin. Pokud se tomuto procesu můžete vyhnout a použít například existující obraz databáze, je to **výrazně doporučeno**.

### 1. Zprovoznění kontejnerů
```console
git clone --recurse-submodules https://github.com/Sawy7/trainmap-web
cd trainmap-web
sudo docker compose up -d
```

### 2. Naplnění databáze (dlouhý proces)
```console
cd submodules/db/auto-db
chmod +x *.sh
sudo docker exec -it trainmap-db /data/bootstrap.sh
```

## Spuštění pouze webové aplikace
> Tento postup slouží pro účely vývoje v *bare metal* režimu. Vhodné v případě externí infrastruktury.

### Příprava spuštění aplikace
```console
npm install
npm run php-deps
```

- Připojení k databázi vyžaduje instalaci a povolení rozšíření `pdo_pgsql` v `php.ini`
- Dále potřeba provést `cp public/config.php.template public/config.php` a změnit parametry pro databázi a simulační API

### Spuštění
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
