<?php
require __DIR__ . "/vendor/autoload.php";

$db = new \PDO("pgsql:dbname=railway_mapdb;host=localhost;port=5432", "railway_map_app", "aeh7OhNui7shie");
$auth = new \Delight\Auth\Auth($db);

if (!$auth->isLoggedIn()) {
    header("Location:login");
    exit;
}
?>
<!doctype html>

<html lang="cz">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Mapster</title>
    
    <!-- Custom Styles -->
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <!-- Loading throbber -->
    <div id="throbberOverlay" style="display: none">
        <div id="throbberContainer" class="text-light text-center">
            <div class="spinner-border" role="status" id="throbber"></div>
            <p>Počkejte prosím</p>
            <small id="throbberMessage"></small>
        </div>
    </div>

    <!-- Alert -->
    <div id="alertPlace"></div>

    <!-- Sidebar -->
    <nav class="navbar navbar-dark bg-dark fixed-top">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Mapster</a>
            <div id="navButtons">
                <!-- <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasElevation" aria-controls="offcanvasElevation" id="elevationButton"><i class="fa fa-area-chart"></i></button> -->
                <!-- <button class="navbar-toggler" type="button" id="notificationButton"><i class="bi bi-bell-fill"></i></button> -->
                <button class="navbar-toggler" type="button" id="hideMarkersButton" data-toggle="tooltip" data-placement="bottom" title="Viditelnost stanic"><i class="bi bi-geo-fill"></i></button>
            </div>
            <button class="navbar-toggler" type="button" id="offcanvasNavbarButton">
                <i class="bi-layers-fill"></i>
            </button>
            <div class="offcanvas offcanvas-end text-bg-dark bg-dark text-light" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Vrstvy</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body">
                    <div class="list-group" id="layersList"></div>
                    <br>
                    <div class="list-group">
                        <a class="list-group-item list-group-item-primary text-center" href="#" id="layerBuilderButton">
                            <i class="bi-hammer"></i>
                            <i class="bi-layers-half"></i>
                        </a>
                    </div>
                    <br><br>
                    <div id="gpxFileForm">
                        <h5>Nahrát vrstvu ze souboru GPX</h5>
                        <br>
                        <div id="gpxFileInputContainer" class="input-group mb-3">
                            <input class="form-control bg-dark text-light" type="file" id="gpxFileInput">
                        </div>
                    </div>
                    <br><br>
                    <div id="shapefileForm">
                        <h5>Nahrát vrstvu ze souboru shapefile</h5>
                        <br>
                        <div id="shapefileInputContainer" class="input-group mb-3">
                            <input class="form-control bg-dark text-light" type="file" id="shapefileInput">
                        </div>
                    </div>
                    <div id="userInfo" class="text-center" style="position: absolute; bottom: 0; width: 100%">
                        <br>
                        <p>
                            <?php
                            echo('<button class="btn btn-secondary float-start" disabled>' . $auth->getEmail() . '</button>');
                            ?>
                            <a class="btn btn-danger" href="/login/logout.php"><i class="bi bi-door-open-fill"></i> Odhlásit</a>
                        </p>
                    </div>
                    <!-- <div id="enetLogo">
                        <img src="custom-assets/enet.png" style="width: 100%;">
                    </div> -->
                </div>
            </div>
        </div>
    </nav>

    <!-- Histogram area -->
    <div class="offcanvas offcanvas-bottom text-bg-dark bg-dark text-light" data-bs-scroll="true" data-bs-backdrop="false" tabindex="-1" id="offcanvasElevation" aria-labelledby="offcanvasElevationLabel">
        <div class="offcanvas-header">
            <div>
                <h5 class="offcanvas-title" id="offcanvasElevationLabel">Informace o trati</h5>
                <h6 id="offcanvasRailName">[název trati]</h6>
            </div>
            <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="elevationVisualTab" data-bs-toggle="tab" data-bs-target="#elevationVisual" type="button" role="tab" aria-controls="elevationVisual" aria-selected="true">Vizualizace</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="trainPickerTab" data-bs-toggle="tab" data-bs-target="#trainPicker" type="button" role="tab" aria-controls="trainPicker" aria-selected="false">Vlaky</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="stationListTab" data-bs-toggle="tab" data-bs-target="#stationList" type="button" role="tab" aria-controls="stationList" aria-selected="false">Stanice</button>
                </li>
            </ul>
            <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div class="tab-content" id="myTabContent">
                <div class="tab-pane fade show active" id="elevationVisual" role="tabpanel" aria-labelledby="elevationVisualTab">
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-10" id="elevationChartDiv">
                                <h6>Graf</h6>
                                <div id="elevationChartWrapperDiv">
                                    <canvas id="elevationChart"></canvas>
                                </div>
                            </div>
                            <div class="col-2" id="elevationDataDiv">
                                <div class="list-group">
                                    <a href="#" class="list-group-item list-group-item-dark list-group-item-action flex-column align-items-start">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h5 class="mb-1">Data</h5>
                                        </div>
                                    </a>
                                    <a href="#" class="list-group-item list-group-item-dark list-group-item-action d-flex justify-content-between align-items-center">
                                        <span class="badge bg-primary">Výška <i class="bi-rulers"></i></span> <span id="dataHeight">210-250</span>
                                    </a>
                                    <a href="#" class="list-group-item list-group-item-dark list-group-item-action d-flex justify-content-between align-items-center">
                                        <span class="badge bg-danger">Hmotnost <i class="bi-train-front-fill"></i></span> - kg
                                    </a>
                                    <a href="#" class="list-group-item list-group-item-dark list-group-item-action d-flex justify-content-between align-items-center">
                                        <span class="badge bg-danger">Spotřeba <i class="bi-fuel-pump-fill"></i></span> - KWh
                                    </a>
                                </div>
                                <div class="list-group">
                                    <a class="list-group-item list-group-item-primary text-center" href="#" id="trainPickerButton">
                                        <i class="bi-arrow-left-right"></i> Cesta zpět
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="trainPicker" role="tabpanel" aria-labelledby="trainPickerTab">
                    <div class="row">
                        <div class="card card-gray-dark" style="width: 18rem;">
                            <img src="https://www.cd.cz/assets/info/regionalni-vlak480x170.jpg" class="card-img-top" alt="..." style="width: 262px; height: 92.8px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">City Shark</h5>
                                <p class="card-text">
                                    <p>
                                        <span class="badge bg-danger">Hmotnost <i class="bi-train-front-fill"></i></span> 23000 kg

                                    </p>
                                    <span class="badge bg-danger">Spotřeba <i class="bi-fuel-pump-fill"></i></span> 250 KWh/km
                                </p>
                                <a href="#" class="stretched-link"></a>
                            </div>
                        </div>
                        <br>
                        <div class="card card-gray-dark" style="width: 18rem;">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/471_035_CD_Ostrava.jpg" class="card-img-top" alt="..." style="width: 262px; height: 92.8px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">City Elefant</h5>
                                <p class="card-text">
                                    <p>
                                        <span class="badge bg-danger">Hmotnost <i class="bi-train-front-fill"></i></span> 24000 kg

                                    </p>
                                    <span class="badge bg-danger">Spotřeba <i class="bi-fuel-pump-fill"></i></span> 290 KWh/km
                                </p>
                                <a href="#" class="stretched-link"></a>
                            </div>
                        </div>
                        <br>
                        <div class="card card-gray-dark" style="width: 18rem;">
                            <img src="https://zdopravy.cz/wp-content/uploads/2021/01/pendolino.jpg" class="card-img-top" alt="..." style="width: 262px; height: 92.8px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">Pendolino</h5>
                                <p class="card-text">
                                    <p>
                                        <span class="badge bg-danger">Hmotnost <i class="bi-train-front-fill"></i></span> 29000 kg

                                    </p>
                                    <span class="badge bg-danger">Spotřeba <i class="bi-fuel-pump-fill"></i></span> 310 KWh/km
                                </p>
                                <a href="#" class="stretched-link"></a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="stationList" role="tabpanel" aria-labelledby="stationListTab">
                    <nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb" class="text-light">
                        <ol class="breadcrumb text-light" id="stationBreadcrumbs">
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>

    <!-- Log Modal -->
    <div class="modal fade" id="logModal" tabindex="-1" aria-labelledby="logModalLabel" aria-hidden="true">
        <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="logModalLabel">Log</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="logModalBody">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zavřít</button>
                <button type="button" class="btn btn-primary" id="logModalSaveButton">Uložit na disk</button>
            </div>
        </div>
        </div>
    </div>

    <!-- DBLayerBuilder Modal -->
    <div class="modal fade" id="dbLayerBuilderModal" tabindex="-1" aria-labelledby="dbLayerBuilderModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content text-bg-dark bg-dark text-light">
            <div class="modal-header">
                <h5 class="modal-title" id="dbLayerBuilderModalLabel">Sestavení nové vrstvy</h5>
                <input type="text" class="form-control" id="dbLayerBuilderSearch" placeholder="Filtrovat...">
                <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="dbLayerBuilderModalBody">
                <ul class="list-group">
                    <li class="list-group-item list-group-item-primary"><input class="form-check-input me-1" type="checkbox" id="dbLayerBuilderCheckAll">
                        Přidat do výběru zobrazené
                    </li>
                </ul>
                <br>
                <ul class="list-group" id="dbLayerBuilderResults"></ul>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zavřít</button>
                <div class="col" id="dbLayerBuilderColorDiv">
                    <input type="color" class="form-control form-control-color" id="dbLayerBuilderColor" value="#c01c28" title="Barva vrstvy">
                </div>
                <div class="col" id="dbLayerBuilderNameDiv">
                    <div>
                        <input type="text" class="form-control" id="dbLayerBuilderName" placeholder="Název vrstvy" required>
                        <div class="invalid-tooltip">
                            Název vrstvy nemůže být prázdný.
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary" id="dbLayerBuilderModalCreateButton">Vytvořit</button>
            </div>
        </div>
        </div>
    </div>

    <!-- Notification -->
    <!-- <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <img src="..." class="rounded me-2" alt="...">
                <strong class="me-auto">Bootstrap</strong>
                <small>11 mins ago</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                Hello, world! This is a toast message.
            </div>
        </div>
    </div> -->
    
    <div class="container-fluid">
        <div class="row">
            <div id="map"></div>
        </div>
    </div>
    
    <script src="index.js"></script>
    <link rel="stylesheet" href="custom-leaflet.css">
</body>
</html>
