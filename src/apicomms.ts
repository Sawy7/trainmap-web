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
}
