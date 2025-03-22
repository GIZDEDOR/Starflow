const DEFAULT_URL ="https://api.gizdo.ru";

async function request(endpoint: string, method: string = "get", data? : any) {
    const options: RequestInit = {
        method: method,
        headers: {
            Authorization: "...",
            ContentType: "application/json",
            Accept: "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(`${DEFAULT_URL}/api/${endpoint}`, options);
    const jsonData = await response.json();

    if (response.ok) return jsonData;  
}

export default request;