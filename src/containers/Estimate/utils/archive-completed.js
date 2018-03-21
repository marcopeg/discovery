/*
    eslint
        import/prefer-default-export: off,
*/

export const archiveCompleted = (ctx) => {
    const details = { ...ctx.state.details }
    const collapsedItems = [ ...ctx.state.collapsedItems ]
    let { activeItem } = ctx.state

    const check = nodes => nodes
        .map((node) => {
            let keep = true
            let { children } = node
            const item = details[node.id]

            // leaf node
            if (item.status === true) {
                keep = false

            // subtree node
            } else if (children) {
                const prevLength = children.length
                children = check([ ...children ])

                if (!children.length && prevLength > 0) {
                    details[node.id].status = true
                    keep = false
                }
            }

            if (!keep) {
                // remove from collapsed item
                const collapsedIdx = collapsedItems.indexOf(node.id)
                if (collapsedIdx !== -1) {
                    collapsedItems.splice(collapsedIdx, 1)
                }

                // deselect active item
                if (activeItem === node.id) {
                    activeItem = null
                }

                details[node.id].archived = true
            }

            return { ...node, keep, children }
        })
        .filter(node => node.keep)

    const items = check([ ...ctx.state.items ])

    ctx.updateStateWithItems(items, {
        details,
        collapsedItems,
        activeItem,
    })
}
