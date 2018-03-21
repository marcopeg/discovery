/* global localStorage window document */

import request from 'lib/request'
import downloadJson from './download-json'
import uploadJson from './upload-json'

export const hipenize = str => str.replace(/ +/g, '-').toLowerCase()

export const getStorageName = ctx => `${hipenize(ctx.state.title)}-${ctx.props.projectId}`

const getLocalStorageName = ctx => (
    ctx.props.match.params.projectId
        ? `discovery-${ctx.props.match.params.projectId}`
        : 'discovery-default'
)

export const saveToBrowser = (ctx) => {
    const {
        title,
        items,
        details,
        activeItem,
        collapsedItems,
    } = ctx.state

    localStorage.setItem(ctx.props.projectId, JSON.stringify({
        title,
        items,
        details,
        activeItem,
        collapsedItems,
    }))
}

export const loadFromBrowser = (ctx) => {
    try {
        const doc = JSON.parse(localStorage.getItem(ctx.props.projectId))
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

export const saveProject = async (ctx) => {
    const {
        title,
        items,
        details,
        activeItem,
        collapsedItems,
    } = ctx.state

    const res = await request(`https://api.myjson.com/bins/${ctx.props.projectId}`, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
            title,
            items,
            details,
            activeItem,
            collapsedItems,
        }),
    })
    if (res.status !== 200) {
        alert('the project was not saved') // eslint-disable-line
    }
}

export const goToNewProject = () => {
    setTimeout(() => {
        const win = window.open('/', '_blank')
        win.focus()
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

export const loadFromDisk = async (ctx) => {
    try {
        const doc = await uploadJson()

        // eslint-disable-next-line
        if (!confirm('Confirm you want to replace the current project with the one you uploaded?')) {
            return
        }

        localStorage.setItem(ctx.props.projectId, JSON.stringify(doc))

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

        await saveProject(ctx)
    } catch (err) {
        alert('Errors loading the file') // eslint-disable-line
        console.error(err) // eslint-disable-line
    }
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
