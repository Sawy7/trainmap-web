import L from "leaflet";
import * as shp from "shpjs";
import { App } from "./app";
import { LogNotify } from "./lognotify";
import { MapEntityFactory } from "./mapentityfactory";
import { SingleMapRoad } from "./singleroad";

export class FileLoader {
    // https://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
    static SetupGPXLoader() {
        let fileInput = document.getElementById("gpxFileInput");
        fileInput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (!target.files)
                return;
            let file = target.files[0];

            let reader = new FileReader();
            reader.onload = (e: Event) => {
                const target = e.target as FileReader;
                let contents = target.result as string;
                let xmlParser = new DOMParser();
                let xmlDoc = xmlParser.parseFromString(contents, "text/xml");

                let rootNode = xmlDoc.getElementsByTagName("trkseg")[0];
                let pointCount = rootNode.childElementCount;

                let pointsArr: L.LatLng[] = [];
                let elevArr: number[] = [];

                // Note: GPX ze Seznamu obsahuje duplicity
                for (let i = 0; i < pointCount; i++) {
                    let pointLat = rootNode.children[i].getAttribute("lat");
                    let pointLong = rootNode.children[i].getAttribute("lon");
                    pointsArr.push(new L.LatLng(+pointLat, +pointLong));
                    let pointElev = rootNode.children[i].children[0].innerHTML;
                    elevArr.push(+pointElev);
                }

                let addFunction = (name: string) => {
                    let gpxLayer = MapEntityFactory.CreateMapLayer(name);
                    gpxLayer.AddMapRoads(MapEntityFactory.CreateSingleMapRoad(pointsArr, elevArr, "Cesta", "purple"));
                    App.Instance.AddMapLayer(gpxLayer);
                }
                FileLoader.SpawnNameInput("gpxFileInputContainer", addFunction);

            };
            reader.readAsText(file);
        }
    }

    static SetupShapefileLoader() {
        let fileInput = document.getElementById("shapefileInput");
        fileInput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (!target.files)
                return;
            let file = target.files[0];
            let reader = new FileReader();
            reader.onload = (e: Event) => {
                LogNotify.ToggleThrobber();
                shp(reader.result)
                .then((geojson) => {
                    let multiPointsArr: L.LatLng[][] = [];
                    let multiElevArr: number[][] = [];
                    geojson["features"].forEach(feature => {
                        let pointsArr: L.LatLng[] = [];
                        let elevArr: number[] = [];
                        feature["geometry"]["coordinates"].forEach(coords => {
                            // let gpsPoint = proj4("EPSG:5514", "EPSG:4326", coords); // NOTE: .prj file must have correct projection spec
                            pointsArr.push(new L.LatLng(coords[1], coords[0]));
                            elevArr.push(coords[2]);
                        });
                        multiPointsArr.push(pointsArr);
                        multiElevArr.push(elevArr);
                    });

                    let addFunction = (name: string) => {
                        let shapefileLayer = MapEntityFactory.CreateMapLayer(name);
                        // shapefileLayer.AddMapRoads(new SingleMapRoad(multiPointsArr, multiElevArr, "Cesta", "blue"));
                        for (let i = 0; i < multiPointsArr.length; i++) {
                            shapefileLayer.AddMapRoads(new SingleMapRoad(multiPointsArr[i], multiElevArr[i], "Cesta", "blue"));
                        }
                        App.Instance.AddMapLayer(shapefileLayer);
                        // this.SaveLayersToLocalStorage();
                    }
                    FileLoader.SpawnNameInput("shapefileInputContainer", addFunction);
                    LogNotify.ToggleThrobber();
                })
                .catch(error => {
                    console.error(error.stack);
                    LogNotify.ToggleThrobber();
                });
            };
            reader.readAsArrayBuffer(file);
        }
    }

    static SpawnNameInput(containerId: string, addFunction: Function) {
        let container = document.getElementById(containerId);
        let input = container.children[0] as HTMLInputElement;
        input.setAttribute("type", "text");
        input.setAttribute("placeholder", "Název nové vrstvy");

        let addButton = document.createElement("button");
        addButton.setAttribute("class", "btn btn-outline-primary");
        addButton.setAttribute("type", "button");
        addButton.innerHTML = "Vložit";
        addButton.onclick = () => {
            addFunction(input.value);
            this.DestroyNameInput(container);
        }
        container.appendChild(addButton);

        let cancelButton = document.createElement("button");
        cancelButton.setAttribute("class", "btn btn-outline-danger");
        cancelButton.setAttribute("type", "button");
        cancelButton.innerHTML = "Zrušit";
        cancelButton.onclick = () => {
            this.DestroyNameInput(container);
        }
        container.appendChild(cancelButton);
    }

    static DestroyNameInput(container: HTMLElement) {
        let input = container.children[0] as HTMLInputElement;
        input.setAttribute("type", "file");
        input.removeAttribute("placeholder");

        container.removeChild(container.children[1]);
        container.removeChild(container.children[1]);
    }
}