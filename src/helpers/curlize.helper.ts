import { AxiosRequestConfig } from 'axios';

export default function getCurlString(request: AxiosRequestConfig): string {
    let curlString = 'curl';

    // Method
    curlString += ` -X ${request.method?.toUpperCase()}`;

    // URL
    curlString += ` "${request.url}"`;

    // Headers
    for (const property in request.headers) {
        if ({}.hasOwnProperty.call(request.headers, property)) {
            const header = `${property}:${request.headers[property]}`;
            curlString += ` -H '${header}'`;
        }
    }

    // Body
    if (request.data && request.method?.toUpperCase() !== 'GET') {
        let data = request.data;
        try {
            if (
                typeof request.data === 'object' ||
                Object.prototype.toString.call(request.data) === '[object Array]'
            ) {
                data = JSON.stringify(request.data);
            }
        } catch (e) {
            console.log('curlize.helper.ts ~ failed to stringify request body; dumping as is');
        }
        curlString += ` --data '${data}'`;
    }

    return curlString;
}
