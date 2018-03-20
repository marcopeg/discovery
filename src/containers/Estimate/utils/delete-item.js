/*
    eslint
        import/prefer-default-export: off,
        no-restricted-syntax: off,
*/

import tree2array from './tree2array'
import treeDeleteNode from './tree-delete-node'

export const deleteActiveItem = (ctx) => {
    // eslint-disable-next-line
    if (!confirm('remove it all?')) {
        return
    }

    const {
        details,
        flatItemsMap,
        activeItem,
        collapsedItems,
    } = ctx.state

    const node = flatItemsMap[activeItem]
    const subtree = tree2array(node.item.children)

    // get previous
    const idx = ctx.state.flatItems.indexOf(ctx.state.activeItem)
    const prevActiveItem = (
        ctx.state.flatItems[idx - 1]
            ? ctx.state.flatItems[idx - 1]
            : ctx.state.flatItems[0]
    )

    // remove from tree
    const items = treeDeleteNode(ctx.state.items, ctx.state.activeItem)
    delete details[node.id]

    for (const nodeId of subtree) {
        delete details[nodeId]
        const idx1 = collapsedItems.indexOf(nodeId)
        if (idx1 !== -1) {
            collapsedItems.splice(idx1, 1)
        }
    }

    const nextFlatItems = tree2array(items)

    ctx.updateStateWithItems(items, {
        details,
        collapsedItems,
        activeItem: (
            nextFlatItems.indexOf(prevActiveItem) !== -1
                ? prevActiveItem
                : nextFlatItems[0]
        ),
    })
}
