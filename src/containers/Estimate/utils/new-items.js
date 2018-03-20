
const getNewId = ctx => (
    ctx.state.flatItems.length
        ? Math.max(...ctx.state.flatItems) + 1
        : 1
)

const getNewDetails = () => ({
    status: false,
    description: 'new item',
    estimate: 0,
})

const update = (ctx, id, items) =>
    ctx.updateStateWithItems(items, {
        activeItem: id,
        isEditMode: true,
        details: {
            ...ctx.state.details,
            [id]: getNewDetails(),
        },
    })

export const tailNewItem = (ctx) => {
    const id = getNewId(ctx)
    update(ctx, id, [
        ...ctx.state.items,
        { id },
    ])
}

export const appendNewItem = (ctx) => {
    const id = getNewId(ctx)

    const inject = (nodes) => {
        const ids = nodes.map(item => item.id)
        const idx = ids.indexOf(ctx.state.activeItem)
        if (idx !== -1) {
            nodes.splice(idx + 1, 0, { id })
        } else {
            nodes
                .filter(node => node.children)
                .forEach(node => inject(node.children))
        }
        return nodes
    }

    update(ctx, id, inject([ ...ctx.state.items ]))
}

export const injectNewItem = (ctx) => {
    const id = getNewId(ctx)

    const inject = (nodes) => {
        const ids = nodes.map(item => item.id)
        const idx = ids.indexOf(ctx.state.activeItem)
        if (idx !== -1) {
            if (!nodes[idx].children) {
                nodes[idx].children = [] // eslint-disable-line
            }
            nodes[idx].children.push({ id })
        } else {
            nodes
                .filter(node => node.children)
                .forEach(node => inject(node.children))
        }
        return nodes
    }

    update(ctx, id, inject([ ...ctx.state.items ]))
}
