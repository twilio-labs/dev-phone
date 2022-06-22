import getPort from 'get-port'

export function isValidPort (port:string) {
    const portRegex = /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/gi;
    return portRegex.test(port)
}

export async function getAvailablePort() {
    const availablePort = await getPort({port: [1337, 3000, 3001, 8000, 8080]})
    return availablePort
}