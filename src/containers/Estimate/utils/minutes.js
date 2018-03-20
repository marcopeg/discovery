
const wday = 60 * 6
const week = wday * 5
const wmon = wday * 20
const wyea = wday * 250

export const minutes2string = (value) => {
    if (value >= wyea) {
        const years = Math.round((value / wyea) * 10) / 10
        return `${years} years`
    }

    if (value >= wmon) {
        const months = Math.floor(value / wmon)
        const days = Math.floor((value - (months * wmon)) / wday)
        return days
            ? `${months}m ${days}d`
            : `${months}m`
    }

    if (value >= week) {
        const weeks = Math.floor(value / week)
        const days = Math.floor((value - (weeks * week)) / wday)
        return days
            ? `${weeks}w ${days}d`
            : `${weeks}w`
    }

    if (value >= wday) {
        const days = Math.floor(value / wday)
        const hours = Math.floor((value - (days * wday)) / 60)
        return hours
            ? `${days}d ${hours}h`
            : `${days}d`
    }

    if (value >= 60) {
        const hours = Math.floor(value / 60)
        const min = value - (hours * 60)
        return min
            ? `${hours}h ${min}m`
            : `${hours}h`
    }

    return `${value} minutes`
}

export const string2minutes = (str) => {
    const intPart = parseFloat(str, 10)
    let multiplier = 1

    if (str.toString().indexOf('d') !== -1) {
        multiplier = wday
    } else if (str.toString().indexOf('h') !== -1) {
        multiplier = 60
    } else if (str.toString().indexOf('w') !== -1) {
        multiplier = week
    } else if (str.toString().indexOf('m') !== -1) {
        multiplier = wmon
    } else if (str.toString().indexOf('y') !== -1) {
        multiplier = wyea
    }

    return intPart * multiplier
}

export default minutes2string
