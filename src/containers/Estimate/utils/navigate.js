
export const up = (ctx) => {
    const { flatItems, activeItem } = ctx.state
    let nextIndex = null
    let loopGuard = 0
    let index = flatItems.indexOf(activeItem)

    if (index === -1) {
        nextIndex = flatItems[flatItems.length - 1] // eslint-disable-line
    } else if (flatItems[index - 1]) {
        nextIndex = flatItems[index - 1]
    }

    while (loopGuard < 100 && ctx.isVisible(nextIndex) !== true) {
        index = flatItems.indexOf(nextIndex)
        if (index === -1) {
            nextIndex = flatItems[flatItems.length - 1] // eslint-disable-line
        } else if (flatItems[index - 1]) {
            nextIndex = flatItems[index - 1]
        }
        loopGuard += 1
    }

    ctx.selectItem(nextIndex)
}

export const down = (ctx) => {
    const { flatItems } = ctx.state
    let index = flatItems.indexOf(ctx.state.activeItem)
    let nextIndex = null
    let loopGuard = 0

    if (index === -1) {
        nextIndex = flatItems[0] // eslint-disable-line
    } else if (flatItems[index + 1]) {
        nextIndex = flatItems[index + 1]
    }

    while (loopGuard < 100 && ctx.isVisible(nextIndex) !== true) {
        index = flatItems.indexOf(nextIndex)
        if (index === -1) {
            nextIndex = flatItems[0] // eslint-disable-line
        } else if (flatItems[index + 1]) {
            nextIndex = flatItems[index + 1]
        }
        loopGuard += 1
    }

    ctx.selectItem(nextIndex)
}

export const left = (ctx) => {
    const node = ctx.state.flatItemsMap[ctx.state.activeItem]
    if (!node.parents) {
        return up(ctx)
    }

    return ctx.selectItem(node.parents[node.parents.length - 1].id)
}

export const right = (ctx) => {
    const activeNode = ctx.state.flatItemsMap[ctx.state.activeItem]
    if (!activeNode.parents) {
        return down(ctx)
    }

    const parentNode = activeNode.parents[activeNode.parents.length - 1]
    // eslint-disable-next-line
    const grandParentNode = activeNode.parents[activeNode.parents.length - 2] || { children: ctx.state.items }

    const ids = grandParentNode.children.map(node => node.id)
    const idx = ids.indexOf(parentNode.id)

    if (ids[idx + 1]) {
        ctx.selectItem(ids[idx + 1])
    }

    return true
}
