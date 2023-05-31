import L from "leaflet";
import * as shp from "shpjs";
import { App } from "./app";
import { LogNotify } from "./lognotify";
import { MapEntityFactory } from "./mapentityfactory";
import { SingleMapRoad } from "./singleroad";

export class FileLoader {
    // https://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
    static SetupFileLoader() {
        let fileInput = document.getElementById("fileInput");
        fileInput.onchange = (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (!target.files)
                return;
            let file = target.files[0];
            let splitFileName = file.name.split(".");
            let fileExtension = splitFileName[splitFileName.length-1].toLowerCase();
            let reader = new FileReader();
            switch (fileExtension) {
                case "gpx":
                    reader.onload = this.LoadGPXFile;
                    reader.readAsText(file);
                    break;
                case "zip":
                    reader.onload = this.LoadShapefile;
                    reader.readAsArrayBuffer(file);
                    break;
                default:
                    this.ThrowGenericError();
                    break;
            }
        }
    }

    static LoadGPXFile(e: Event) {
        LogNotify.ToggleThrobber();
        try {
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
            FileLoader.SpawnNameInput("fileInputContainer", addFunction);
        } catch (error) {
            this.ThrowGenericError();
        } finally {
            LogNotify.ToggleThrobber();
        }
    }

    static LoadShapefile(e: Event) {
        LogNotify.ToggleThrobber();
        const target = e.target as FileReader;
        shp(target.result).then((geojson) => {
            let multiPointsArr: L.LatLng[][] = [];
            let multiElevArr: number[][] = [];
            geojson["features"].forEach(feature => {
                let pointsArr: L.LatLng[] = [];
                let elevArr: number[] = [];
                feature["geometry"]["coordinates"].forEach(coords => {
                    pointsArr.push(new L.LatLng(coords[1], coords[0]));
                    elevArr.push(coords[2]);
                });
                multiPointsArr.push(pointsArr);
                multiElevArr.push(elevArr);
            });

            let addFunction = (name: string) => {
                let shapefileLayer = MapEntityFactory.CreateMapLayer(name);
                for (let i = 0; i < multiPointsArr.length; i++) {
                    shapefileLayer.AddMapRoads(new SingleMapRoad(multiPointsArr[i], multiElevArr[i], "Cesta", "blue"));
                }
                App.Instance.AddMapLayer(shapefileLayer);
            }
            FileLoader.SpawnNameInput("fileInputContainer", addFunction);
            LogNotify.ToggleThrobber();
        })
        .catch(error => {
            FileLoader.ThrowGenericError();
            LogNotify.ToggleThrobber();
        });
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

    static ThrowGenericError() {
        LogNotify.PushAlert("Tento typ souboru není podporován, nebo nastala v jeho zpracování chyba.",
            undefined, undefined, "danger");
    }
}