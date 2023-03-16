// JS Requests: https://stackoverflow.com/questions/247483/http-get-request-in-javascript
export class ApiComms {
    static GetRequest(url: string): string {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, false);
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }
    
    static GetRequestAsync(url: string, callback: Function) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }

    static PostRequest(url: string, data: string): string {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("POST", url, false);
        xmlHttp.send(data);
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
        xmlHttp.send(dataString);
        return xmlHttp.responseText;
    }
}
