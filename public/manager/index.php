<?php
require __DIR__ . "/../dbbase.php";

$auth = new \Delight\Auth\Auth($db);

if (!$auth->isLoggedIn()) {
    header("Location:login");
    exit;
}
?>
<!doctype html>
<html lang="cs" data-bs-theme="dark">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Energetická náročnost vlakového provozu</title>
</head>

<body class="d-flex flex-column min-vh-100">
    <!-- Alert -->
    <div id="alertPlace"></div>
    
    <div class="container">
        <br>
        <h1><i class="bi bi-train-front"></i> Energetická náročnost vlakového provozu</h1>
        <select class="form-select mb-3" aria-label="Prosím vyberte trať ze seznamu" id="railList">
            <option disabled selected>Prosím vyberte trať ze seznamu</option>
        </select>
        <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane"
                    type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">
                    <i class="bi bi-table"></i> Plánovač provozu
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane"
                    type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">
                    <i class="bi bi-x-diamond"></i> Vodík
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact-tab-pane"
                    type="button" role="tab" aria-controls="contact-tab-pane" aria-selected="false">
                    <i class="bi bi-plug-fill"></i> Elektřina
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="result-tab" data-bs-toggle="tab" data-bs-target="#result-tab-pane"
                    type="button" role="tab" aria-controls="result-tab-pane" aria-selected="false">
                    <i class="bi bi-clipboard-data"></i> Výsledný výpočet
                </button>
            </li>
        </ul>
        <div class="tab-content" id="myTabContent">
            <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab"
                tabindex="0">
                <br>
                <h3>Mapa trati</h3>
                <div id="map" style="height: 180px;"></div>
                <br>

                <h3>Jízdní řád</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Název vlaku</th>
                            <th>Výkon</th>
                            <th>Hmotnost lokomotivy</th>
                            <th>Hmotnost vagónů</th>
                            <th>Počet jízd</th>
                            <th>Zastávky</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Motorový vůz ČSD 860</td>
                            <td>480 kW</td>
                            <td>56 000 kg</td>
                            <td>64 490 kg</td>
                            <td>4</td>
                            <td>
                                <a data-bs-toggle="offcanvas" data-bs-target="#stopsOffcanvas" href="#"
                                    style="text-decoration: none;"><i class="bi bi-pencil"></i> Upravit
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>CityElefant 471</td>
                            <td>2000 kW</td>
                            <td>155 400 kg</td>
                            <td>102 400 kg</td>
                            <td>12</td>
                            <td>
                                <a data-bs-toggle="offcanvas" data-bs-target="#stopsOffcanvas" href="#"
                                    style="text-decoration: none;"><i class="bi bi-pencil"></i> Upravit
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>RegioPanter 650</td>
                            <td>1360 kW</td>
                            <td>102 800 kg</td>
                            <td>102 800 kg</td>
                            <td>10</td>
                            <td>
                                <a data-bs-toggle="offcanvas" data-bs-target="#stopsOffcanvas" href="#"
                                    style="text-decoration: none;"><i class="bi bi-pencil"></i> Upravit
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <!-- Button trigger modal -->
                <div class="d-flex justify-content-end">
                    <button type="button" class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#myModal">
                        + Přidat jízdu vlaku
                    </button>
                </div>

                <!-- Train params -->
                <div class="offcanvas offcanvas-end" tabindex="-1" id="myModal" aria-labelledby="exampleModalLabel">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title" id="exampleModalLabel">Přidat jízdu vlaku</h5>
                        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                            aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <label for="trainName" class="form-label">Název vlaku</label>
                        <select id="trainName" onchange="autofillValues()" class="form-select">
                            <option value="train1">Motorový vůz ČSD 860</option>
                            <!-- Add more options as needed -->
                        </select>
                        <br>

                        <label for="trainPower" class="form-label">Výkon lokomotivy</label>
                        <input type="text" id="trainPower" class="form-control" disabled>
                        <br>

                        <label for="locomotiveWeight" class="form-label">Hmotnost lokomotivy</label>
                        <input type="text" id="locomotiveWeight" class="form-control" disabled>
                        <br>

                        <label for="wagonWeight" class="form-label">Hmotnost vagónů</label>
                        <input type="text" id="wagonWeight" class="form-control" disabled>
                        <br>

                        <label for="trainCount" class="form-label">Počet jízd denně (tam i zpět)</label>
                        <input type="number" id="trainCount" class="form-control" min="1" value="1">
                        <br>

                        <div class="d-grid gap-2 d-flex justify-content-center">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="offcanvas">Zavřít</button>
                            <button type="button" class="btn btn-primary" data-bs-dismiss="offcanvas"
                                onclick="addRow()">Vložit do plánu</button>
                        </div>
                    </div>
                </div>

                <!-- Stops -->
                <div class="offcanvas offcanvas-bottom" tabindex="-1" id="stopsOffcanvas"
                    aria-labelledby="stopsOffcanvasLabel">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title" id="stopsOffcanvasLabel">Zastávky pro spoj</h5>
                        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                            aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <p style="color: grey;">
                            <i class="bi bi-flag-fill"></i> Ve zvolených stanovištích bude spoj zastavovat
                        </p>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox1">Valašské Meziříčí</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox2" value="option2"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox2">Hostašovice</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox3" value="option3"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox3">Mořkov hlavní trať</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox4" value="option4"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox4">Veřovice</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox5" value="option5"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox5">Frenštát pod Radhoštěm město</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox6" value="option6"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox6">Frenštát pod Radhoštěm</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox7" value="option7"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox7">Kunčice pod Ondřejníkem</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox8" value="option8"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox8">Čeladná</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox9" value="option9"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox9">Frýdlant nad Ostravicí</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox10" value="option10"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox10">Pržno</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox11" value="option11"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox11">Baška</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox12" value="option12"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox12">Frýdek-Místek</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox13" value="option13"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox13">Lískovec u Frýdku</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox14" value="option14"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox14">Paskov</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox15" value="option15"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox15">Vratimov</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox16" value="option16"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox16">Ostrava-Kunčice</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox17" value="option17"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox17">Ostrava-Kunčičky</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox18" value="option18"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox18">Ostrava střed</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox19" value="option19"
                                checked>
                            <label class="form-check-label" for="inlineCheckbox19">Ostrava-Stodolní</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="1">
                <br>
                <h3>Vodíková plnící stanice</h3>
                <br>

                <div id="hydroSwitch" class="text-center">
                    <h4>Zvolte typ plnící stanice</h4>
                    <button type="button" class="btn btn-outline-primary toggle-btn-h active" data-toggle="button"
                        aria-pressed="true" onclick="toggleButtonHydro(this)">S elektrolyzérem</button>
                    <button type="button" class="btn btn-outline-primary toggle-btn-h" data-toggle="button"
                        aria-pressed="false" onclick="toggleButtonHydro(this)">S dovozem vodíku</button>
                </div>
                <br>

                <div class="text-center">
                    <div class="row text-center" id="hydroElectrolyser">
                        <div class="offset-1 col-4">
                            <label for="cenaPlnicStanice" class="form-label">Cena plnící stanice a zásobníku</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaPlnicStanice" value="500000">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>

                            <label for="cenaElektrolyzeru" class="form-label">Cena elektrolyzéru a technologií</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaElektrolyzeru" value="10000000">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>

                            <label for="cenaH2" class="form-label">Cena 1kg H<sub>2</sub></label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaH2" value="32">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>

                            <label for="cenaUpravyVody" class="form-label">Cena technologie úpravy vody</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaUpravyVody" value="2100000">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>
                        </div>
                        <div class="offset-2 col-4">
                            <label for="cenaVody" class="form-label">Cena vody</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaVody" value="7">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>

                            <label for="cenaOdpadovehoHospodarstvi" class="form-label">Cena odpadového
                                hospodářství</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaOdpadovehoHospodarstvi"
                                    value="1320000">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>

                            <label for="cenaKWh" class="form-label">Cena za kWh</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaKWh" value="5">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>
                        </div>
                    </div>
                    <div class="row text-center">
                        <div class="offset-4 col-4" id="hydroCarrier" style="display: none;">
                            <label for="cenaPlnicStaniceDovoz" class="form-label">Cena plnící stanice a
                                zásobníku</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaPlnicStaniceDovoz" value="2100000">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>

                            <label for="vzdalenostZdrojeVodiku" class="form-label">Vzdálenost v km ke zdroji
                                vodíku</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="vzdalenostZdrojeVodiku" value="64">
                                <span class="input-group-text" id="basic-addon2">km</span>
                            </div>

                            <label for="cenaPrepravyVlakem" class="form-label">Cena za přepravu 1 kg H<sub>2</sub> (1 km
                                vlakem)</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaPrepravyVlakem" value="9">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>

                            <label for="cenaPrepravyNakAut" class="form-label">Cena za přepravu 1kg H<sub>2</sub> (1 km
                                nákl. autem)</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaPrepravyNakAut" value="14">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>

                            <label for="cenaH2Cisteni" class="form-label">Cena 1 kg H<sub>2</sub> včetně čištění</label>
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" id="cenaH2Cisteni" value="39">
                                <span class="input-group-text" id="basic-addon2">Kč</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="tab-pane fade" id="contact-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="2">
                <br>
                <h3>Dobíjecí stanice</h3>

                <div id="electroSwitch" class="text-center">
                    <h4>Zvolte způsob dodání el. energie</h4>
                    <button type="button" class="btn btn-outline-primary toggle-btn-el active" data-toggle="button"
                        aria-pressed="true" onclick="toggleButtonElectro(this)">Dobíjení pod trolejí 25 kV AC</button>
                    <button type="button" class="btn btn-outline-primary toggle-btn-el" data-toggle="button"
                        aria-pressed="false" onclick="toggleButtonElectro(this)">Dobíjení pod trolejí 3kV DC</button>
                    <button type="button" class="btn btn-outline-primary toggle-btn-el" data-toggle="button"
                        aria-pressed="false" onclick="toggleButtonElectro(this)">Výstavba parazitní troleje</button>
                </div>
                <br>

                <div class="row text-center">
                    <div class="offset-4 col-4" id="wire25">
                        <label for="cenaKWhTrolej25" class="form-label">Cena za kWH</label>
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" id="cenaKWhTrolej25" value="5">
                            <span class="input-group-text" id="basic-addon2">Kč</span>
                        </div>
                    </div>

                    <div class="offset-4 col-4" id="wire3" style="display: none;">
                        <label for="cenaKWhTrolej3" class="form-label">Cena za kWH</label>
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" id="cenaKWhTrolej3" value="5">
                            <span class="input-group-text" id="basic-addon2">Kč</span>
                        </div>
                    </div>

                    <div class="offset-4 col-4" id="parasiteWire" style="display: none;">
                        <label for="cenaTechnologie" class="form-label">Cena technologie</label>
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" id="cenaTechnologie" value="21680000">
                            <span class="input-group-text" id="basic-addon2">Kč</span>
                        </div>

                        <label for="cenaPripojky" class="form-label">Cena přípojky el. energie</label>
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" id="cenaPripojky" value="1320000">
                            <span class="input-group-text" id="basic-addon2">Kč</span>
                        </div>

                        <label for="dalsiNaklady" class="form-label">Další náklady</label>
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" id="dalsiNaklady" value="230000">
                            <span class="input-group-text" id="basic-addon2">Kč</span>
                        </div>

                        <label for="cenaKWhParazitniTrolej" class="form-label">Cena za kWH</label>
                        <div class="input-group mb-3">
                            <input type="number" class="form-control" id="cenaKWhParazitniTrolej" value="5">
                            <span class="input-group-text" id="basic-addon2">Kč</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="tab-pane fade" id="result-tab-pane" role="tabpanel" aria-labelledby="result-tab" tabindex="3">
                <br>
                <h3>Výsledky</h3>
            </div>

            <script>
                function toggleButtonHydro(button) {
                    button.classList.toggle('active');
                    let optionOne = document.getElementById("hydroElectrolyser");
                    let optionTwo = document.getElementById("hydroCarrier");
                    if (button == document.getElementById("hydroSwitch").children[2]) {
                        optionOne.style.display = "none";
                        optionTwo.style.display = "";
                    }
                    else {
                        optionOne.style.display = "";
                        optionTwo.style.display = "none";
                    }

                    const buttons = document.querySelectorAll('.toggle-btn-h');
                    buttons.forEach(function (btn) {
                        if (btn !== button) {
                            btn.classList.remove('active');
                        }
                    });
                }

                function toggleButtonElectro(button) {
                    button.classList.toggle('active');
                    let optionOne = document.getElementById("wire25");
                    let optionTwo = document.getElementById("wire3");
                    let optionThree = document.getElementById("parasiteWire");
                    if (button == document.getElementById("electroSwitch").children[1]) {
                        optionOne.style.display = "";
                        optionTwo.style.display = "none";
                        optionThree.style.display = "none";
                    }
                    else if (button == document.getElementById("electroSwitch").children[2]) {
                        optionOne.style.display = "none";
                        optionTwo.style.display = "";
                        optionThree.style.display = "none";
                    }
                    else {
                        optionOne.style.display = "none";
                        optionTwo.style.display = "none";
                        optionThree.style.display = "";
                    }

                    const buttons = document.querySelectorAll('.toggle-btn-el');
                    buttons.forEach(function (btn) {
                        if (btn !== button) {
                            btn.classList.remove('active');
                        }
                    });
                }
            </script>

            <script>
                function autofillValues() {
                    var trainName = document.getElementById("trainName").value;
                    var trainPower = document.getElementById("trainPower");
                    var locomotiveWeight = document.getElementById("locomotiveWeight");
                    var wagonWeight = document.getElementById("wagonWeight");

                    if (trainName === "train1") {
                        trainPower.value = "480 kW";
                        locomotiveWeight.value = "56 000 kg";
                        wagonWeight.value = "64 490 kg";
                    }
                    //  else if (trainName === "train2") {
                    //     locomotiveWeight.value = "preset value for train 2 locomotive weight";
                    //     wagonWeight.value = "preset value for train 2 wagon weight";
                    // }
                    // Add more conditions as needed
                }
                autofillValues();
            </script>

            <script>
                function addRow() {
                    var table = document.querySelector("tbody");
                    var trainName = document.getElementById("trainName").textContent.trim();
                    var trainPower = document.getElementById("trainPower").value;
                    var locomotiveWeight = document.getElementById("locomotiveWeight").value;
                    var wagonWeight = document.getElementById("wagonWeight").value;
                    var trainCount = document.getElementById("trainCount");

                    var row = table.insertRow();
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3);
                    var cell5 = row.insertCell(4);
                    var cell6 = row.insertCell(5);

                    cell1.innerHTML = trainName;
                    cell2.innerHTML = trainPower;
                    cell3.innerHTML = locomotiveWeight;
                    cell4.innerHTML = wagonWeight;
                    cell5.innerHTML = trainCount.value;
                    var stopButton = document.createElement("a");
                    stopButton.setAttribute("data-bs-toggle", "offcanvas");
                    stopButton.setAttribute("data-bs-target", "#stopsOffcanvas");
                    stopButton.style = "text-decoration: none;";
                    stopButton.href = "#";
                    stopButton.innerHTML = '<i class="bi bi-pencil"></i> Upravit';
                    cell6.appendChild(stopButton);
                }
            </script>
        </div>
    </div>
    <!-- Footer -->
    <footer class="text-center mt-auto">
        <p><a href="https://ceet.vsb.cz/cenet/cs/"><img
                    src="https://ceet.vsb.cz/share/webresources/favicons/ceet/apple-touch-icon.png" width="20px"></a>
            Centrum ENET | VŠB-TUO <small>vytvořilo v roce</small> 2024</p>
    </footer>
    <script src="/manager/manager.js"></script>
</body>

</html>