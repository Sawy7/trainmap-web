<?php
require __DIR__ . "/dbbase.php";

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
                <button class="navbar-toggler" type="button" id="hideMarkersButton" data-toggle="tooltip"
                    data-placement="bottom" title="Viditelnost stanic"><i class="bi bi-geo-fill"></i></button>
            </div>
            <button class="navbar-toggler" type="button" id="offcanvasNavbarButton">
                <i class="bi-layers-fill"></i>
            </button>
            <div class="offcanvas offcanvas-end text-bg-dark bg-dark text-light" tabindex="-1" id="offcanvasNavbar"
                aria-labelledby="offcanvasNavbarLabel">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Vrstvy</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"
                        aria-label="Close"></button>
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
                    <div id="fileForm">
                        <h5>Nahrát vrstvu ze souboru</h5>
                        <h6 id="fileLoaderTip">Podporuje GPX a Shapefile (jako .zip)</h6>
                        <div id="fileInputContainer" class="input-group mb-3">
                            <input class="form-control bg-dark text-light" type="file" id="fileInput">
                        </div>
                    </div>
                    <!-- <div id="enetLogo">
                        <img src="custom-assets/enet.png" style="width: 100%;">
                    </div> -->
                </div>
                <div id="userInfo" class="justify-content-between">
                    <br>
                    <?php
                    echo ('<button class="btn btn-secondary float-start" disabled>' . $auth->getEmail() . '</button>');
                    ?>
                    <a class="btn btn-danger" href="/login/logout.php"><i class="bi bi-door-open-fill"></i>Odhlásit</a>
                    <br>
                </div>
            </div>
        </div>
    </nav>

    <!-- Histogram area -->
    <div class="offcanvas offcanvas-bottom text-bg-dark bg-dark text-light" data-bs-scroll="true"
        data-bs-backdrop="false" tabindex="-1" id="offcanvasElevation" aria-labelledby="offcanvasElevationLabel">
        <div class="offcanvas-header">
            <div>
                <h5 class="offcanvas-title" id="offcanvasElevationLabel">Informace o trati</h5>
                <h6 id="offcanvasRailName">[název trati]</h6>
            </div>
            <!-- <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="elevationVisualTab" data-bs-toggle="tab" data-bs-target="#elevationVisual" type="button" role="tab" aria-controls="elevationVisual" aria-selected="true">Vizualizace</button>
                </li>
                <li class="nav-item d-none d-sm-block" role="presentation">
                    <button class="nav-link" id="trainPickerTab" data-bs-toggle="tab" data-bs-target="#trainPicker" type="button" role="tab" aria-controls="trainPicker" aria-selected="false">Vlaky</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="stationListTab" data-bs-toggle="tab" data-bs-target="#stationList" type="button" role="tab" aria-controls="stationList" aria-selected="false">Stanice</button>
                </li>
            </ul> -->
            <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="offcanvas"
                aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="elevationVisualTab" data-bs-toggle="tab"
                        data-bs-target="#elevationVisual" type="button" role="tab" aria-controls="elevationVisual"
                        aria-selected="true">Vizualizace</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="trainPickerTab" data-bs-toggle="tab" data-bs-target="#trainPicker"
                        type="button" role="tab" aria-controls="trainPicker" aria-selected="false">Vlaky</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="stationListTab" data-bs-toggle="tab" data-bs-target="#stationList"
                        type="button" role="tab" aria-controls="stationList" aria-selected="false">Stanice</button>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane fade show active" id="elevationVisual" role="tabpanel"
                    aria-labelledby="elevationVisualTab">
                    <div class="container-fluid">
                        <div class="row">
                            <!-- Padding -->
                            <div class="d-lg-none d-xl-none">
                                <div class="invisible hidden-xs">&nbsp;</div>
                            </div>
                            <!-- Padding -->
                            <div class="col-lg-10" id="elevationChartDiv">
                                <div id="chartPicker">
                                    <div class="dropdown">
                                        <button id="chartPickerButton" class="btn btn-secondary dropdown-toggle"
                                            type="button" data-bs-toggle="dropdown" disabled>
                                            -
                                        </button>
                                        <ul id="chartPickerOptions" class="dropdown-menu dropdown-menu-dark"></ul>
                                    </div>
                                </div>
                                <div id="elevationChartWrapperDiv">
                                    <canvas id="elevationChart"></canvas>
                                </div>
                            </div>
                            <div class="col-lg-2" id="elevationDataDiv">
                                <div class="list-group">
                                    <a href="#"
                                        class="list-group-item list-group-item-dark list-group-item-action flex-column align-items-start">
                                        <div class="d-flex w-100 justify-content-between">
                                            <h5 class="mb-1">Data</h5>
                                        </div>
                                    </a>
                                    <a href="#"
                                        class="list-group-item list-group-item-dark list-group-item-action d-flex justify-content-between align-items-center">
                                        <span class="badge bg-primary">Výška <i class="bi-rulers"></i></span>
                                        <span id="dataHeight">210-250</span>
                                    </a>
                                    <a href="#"
                                        class="list-group-item list-group-item-dark list-group-item-action d-flex justify-content-between align-items-center">
                                        <span class="badge bg-danger">Hmotnost <i
                                                class="bi-train-front-fill"></i></span>
                                        <span id="dataMass">- kg</span>
                                    </a>
                                    <a href="#"
                                        class="list-group-item list-group-item-dark list-group-item-action d-flex justify-content-between align-items-center">
                                        <span class="badge bg-danger">Spotřeba <i class="bi-fuel-pump-fill"></i></span>
                                        <span id="dataEnergy">- kWh</span>
                                    </a>
                                </div>
                                <div class="list-group">
                                    <a class="list-group-item list-group-item-primary text-center" href="#"
                                        id="reverseTrackButton">
                                        <i class="bi-arrow-left-right"></i> Cesta zpět
                                    </a>
                                    <a class="list-group-item list-group-item-primary text-center" href="#"
                                        id="calculateConsumptionButton">
                                        <i class="bi-calculator-fill"></i> Spotřeba
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="tab-pane fade" id="trainPicker" role="tabpanel" aria-labelledby="trainPickerTab">
                    <!-- Padding -->
                    <div class="d-lg-none d-xl-none">
                        <div class="invisible hidden-xs">&nbsp;</div>
                    </div>
                    <!-- Padding -->
                    <div class="d-flex flex-row flex-nowrap" id="trainCardHolder"></div>
                </div>
                <div class="tab-pane fade" id="stationList" role="tabpanel" aria-labelledby="stationListTab">
                    <!-- Padding -->
                    <div class="d-lg-none d-xl-none">
                        <div class="invisible hidden-xs">&nbsp;</div>
                    </div>
                    <!-- Padding -->
                    <nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb" class="text-light">
                        <ol class="breadcrumb text-light" id="stationBreadcrumbs">
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    </div>

    <!-- DBLayerBuilder Modal -->
    <div class="modal fade" id="dbLayerBuilderModal" tabindex="-1" aria-labelledby="dbLayerBuilderModalLabel"
        aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content text-bg-dark bg-dark text-light">
                <div class="modal-header">
                    <h5 class="modal-title" id="dbLayerBuilderModalLabel">Sestavení nové vrstvy</h5>
                    <input type="text" class="form-control" id="dbLayerBuilderSearch" placeholder="Filtrovat...">
                    <button type="button" class="btn-close btn-close-white text-reset" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                </div>
                <div class="modal-body" id="dbLayerBuilderModalBody">
                    <ul class="list-group">
                        <li class="list-group-item list-group-item-primary"><input class="form-check-input me-1"
                                type="checkbox" id="dbLayerBuilderCheckAll">
                            Přidat do výběru zobrazené
                        </li>
                    </ul>
                    <br>
                    <ul class="list-group" id="dbLayerBuilderResults"></ul>
                </div>
                <div class="modal-footer justify-content-end">
                    <div id="dbLayerBuilderColorDiv">
                        <input type="color" class="form-control form-control-color" id="dbLayerBuilderColor"
                            value="#c01c28" title="Barva vrstvy">
                    </div>
                    <div id="dbLayerBuilderNameDiv" class="flex-grow-1">
                        <div>
                            <input type="text" class="form-control" id="dbLayerBuilderName" placeholder="Název vrstvy"
                                required>
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