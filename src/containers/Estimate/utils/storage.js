/* global localStorage window document */

import downloadJson from './download-json'
import uploadJson from './upload-json'

export const hipenize = str => str.replace(/ +/g, '-').toLowerCase()

export const getStorageName = ctx => hipenize(ctx.state.title)

const getLocalStorageName = ctx => (
    ctx.props.match.params.projectId
        ? `discovery-${ctx.props.match.params.projectId}`
        : 'discovery-default'
)

export const saveToBrowser = (ctx, forceTitle = false) => {
    const {
        title,
        items,
        details,
        activeItem,
        collapsedItems,
    } = ctx.state

    const key = forceTitle
        ? `discovery-${hipenize(ctx.state.title)}`
        : getLocalStorageName(ctx)

    localStorage.setItem(key, JSON.stringify({
        title,
        items,
        details,
        activeItem,
        collapsedItems,
    }))
}

export const loadFromBrowser = (ctx) => {
    try {
        const doc = JSON.parse(localStorage.getItem(getLocalStorageName(ctx)))
        if (doc) {
            const {
                title,
                items,
                details,
                activeItem,
                collapsedItems,
            } = doc

            ctx.updateStateWithItems(items, {
                title: title || 'A new project', // backward compatibility
                details,
                activeItem,
                collapsedItems,
            })
        } else {
            // eslint-disable-next-line
            ctx.updateStateWithItems([], {
                title: 'A new project', // backward compatibility
                details: {},
                activeItem: null,
                collapsedItems: [],
            })
        }
    } catch (err) {
        // eslint-disable-next-line
        ctx.updateStateWithItems([], {
            title: 'A new project', // backward compatibility
            details: {},
            activeItem: null,
            collapsedItems: [],
        })
    }
}

export const goToNewProject = (name) => {
    setTimeout(() => {
        window.location.href = `/#/${hipenize(name)}`
        window.location.reload(true)
    })
}

export const updateProjectUrl = (ctx) => {
    setTimeout(() => {
        saveToBrowser(ctx)
        setTimeout(() => {
            window.location.href = `/#/${getStorageName(ctx)}`
            window.location.reload(true)
        })
    })
}

export const saveToDisk = (ctx) => {
    const {
        title,
        items,
        details,
        activeItem,
        collapsedItems,
    } = ctx.state
    saveToBrowser(ctx)

    downloadJson({
        title,
        items,
        details,
        activeItem,
        collapsedItems,
    }, getStorageName(ctx))
}

export const loadFromDisk = () => {
    uploadJson()
        .then((doc) => {
            localStorage.setItem(`discovery-${hipenize(doc.title)}`, JSON.stringify(doc))

            setTimeout(() => {
                window.location.href = `/#/${hipenize(doc.title)}`
                window.location.reload(true)
            })
        })
        .catch((err) => {
            alert('Errors loading the file') // eslint-disable-line
            console.error(err) // eslint-disable-line
        })
}

const str2csv = str => [
    '"',
    str.replace(/"/g, '""'),
    '"',
].join('')

export const exportCsv = (ctx) => {
    const rows = ctx.state.flatItems.map(id => [
        id,
        ctx.state.flatItemsMap[id].depth.toString(),
        (
            (
                ctx.state.flatItemsMap[id].item.children
                && ctx.state.flatItemsMap[id].item.children.length
            )
                ? '-'
                : ctx.state.details[id].estimate.toString()
        ),
        str2csv(ctx.state.details[id].description),
        str2csv(ctx.state.details[id].notes || ''),
    ].join(','))

    const csv = [
        [ 'id', 'level', 'estimate', 'subject', 'notes' ].join(','),
        ...rows,
    ].join('\n')

    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv) // eslint-disable-line
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', getStorageName(ctx) + '.csv') // eslint-disable-line
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
}
