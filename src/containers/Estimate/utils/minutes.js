
const wday = 60 * 6
const week = wday * 5
const wmon = wday * 20
const wyea = wday * 250

const mins2str = num => (
    num > 1
        ? `${num} minutes`
        : `${num} minute`
)

const hours2str = num => (
    num > 1
        ? `${num} hours`
        : `${num} hour`
)

const days2str = num => (
    num > 1
        ? `${num} days`
        : `${num} day`
)

const weeks2str = num => (
    num > 1
        ? `${num} weeks`
        : `${num} week`
)

const months2str = num => (
    num > 1
        ? `${num} months`
        : `${num} month`
)

const years2str = num => (
    num > 1
        ? `${num} years`
        : `${num} year`
)

export const minutes2string = (value) => {
    if (value >= wyea) {
        const years = Math.round((value / wyea) * 10) / 10
        return `${years2str(years)}`
    }

    if (value >= wmon) {
        const months = Math.floor(value / wmon)
        const days = Math.floor((value - (months * wmon)) / wday)
        return days
            ? `${months2str(months)}, ${days2str(days)}`
            : `${months2str(months)}`
    }

    if (value >= week) {
        const weeks = Math.floor(value / week)
        const days = Math.floor((value - (weeks * week)) / wday)
        return days
            ? `${weeks2str(weeks)}, ${days2str(days)}`
            : `${weeks2str(weeks)}`
    }

    if (value >= wday) {
        const days = Math.floor(value / wday)
        const hours = Math.floor((value - (days * wday)) / 60)

        // if (days > 0 && days < 2) {
        //     return 'tomorrow'
        // }

        return hours
            ? `${days2str(days)}, ${hours2str(hours)}`
            : `${days2str(days)}`
    }

    if (value >= 60) {
        const hours = Math.floor(value / 60)
        const min = value - (hours * 60)

        // if (hours > 4) {
        //     return 'today'
        // }

        return min
            ? `${hours2str(hours)} ${mins2str(min)}`
            : `${mins2str(min)}`
    }

    return `${mins2str(value)}`
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
