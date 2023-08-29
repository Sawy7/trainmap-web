// JS Requests: https://stackoverflow.com/questions/247483/http-get-request-in-javascript
export class ApiComms {
    static GetRequest(url: string): string {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, false);
        try {
            xmlHttp.send(null);
        } catch (error) {
            return JSON.stringify({"status": "networkerror"});
        }
        return xmlHttp.responseText;
    }

    static PostRequest(url: string, data: string): string {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", url, false);
        try {
            xmlHttp.send(data);
        } catch (error) {
            return JSON.stringify({"status": "networkerror"});
        }
        return xmlHttp.responseText;
    }
    
    static PostRequestURLEncoded(url: string, data: object): string {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", url, false);
        xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        let dataString = "";
        for (const prop in data) {
            dataString += `${prop}=${data[prop]}&`;
        }
        dataString.slice(0, -1);
        try {
            xmlHttp.send(dataString);
        } catch (error) {
            return JSON.stringify({"status": "networkerror"});
        }
        return xmlHttp.responseText;
    }
}
