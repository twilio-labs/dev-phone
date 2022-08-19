import getPort from 'get-port'
import semver from 'semver'

export function isValidPort (port:string) {
    const portRegex = /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/gi;
    return portRegex.test(port)
}

export async function getAvailablePort() {
    const availablePort = await getPort({port: [1337, 3000, 3001, 8000, 8080]})
    return availablePort
}

// Checks whether an actual version meets some requirement
export function meetsRequiredVersion (actual: string, requirement: string) {
    // ensure that the strings passed are actually valid semver values
    const coercedActual = semver.coerce(actual)
    const coercedRequirement = semver.coerce(requirement)
    if (semver.valid(coercedActual) && semver.valid(coercedRequirement)) {
        // @ts-ignore
        return semver.gt(coercedActual, coercedRequirement) 
    }

    return false
}