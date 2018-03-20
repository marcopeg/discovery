/*
    eslint
        react/prefer-stateless-function: off,
        no-unused-expressions: off,
        react/sort-comp: off,
        no-restricted-syntax: off,
*//* global document window */

import React from 'react'
import PropTypes from 'prop-types'
import Nestable from 'react-nestable'
import { Layout, Menu } from 'antd'

import {
    loadFromBrowser,
    saveToBrowser,
    saveToDisk,
    loadFromDisk,
    updateProjectUrl,
    exportCsv,
    goToNewProject,
} from './utils/storage'

import {
    tailNewItem,
    appendNewItem,
    injectNewItem,
} from './utils/new-items'

import tree2array from './utils/tree2array'
import tree2object from './utils/tree2object'
import treeDeleteNode from './utils/tree-delete-node'
import EstimateItem from './EstimateItem'
import ProjectTitle from './ProjectTitle'
import Sidebar from './Sidebar'

import './estimate.css'

const styles = {}
styles.basics = {
    textAlign: 'left',
    fontFamily: 'verdana',
}
styles.welcome = {
    border: '1px solid #47bde8',
    background: '#afe4ff',
    borderRadius: 4,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    width: '100%',
}
styles.header = {
    position: 'fixed',
    top: 65,
    width: '100vw',
    height: 50,
    borderBottom: '2px solid black',
    marginBottom: 10,
    paddingBottom: 10,
    background: '#fff',
    padding: '5px 45px',
    zIndex: 100,
}
styles.ui = {}
styles.ui.wrapper = {
    margin: '70px 28px',
    display: 'flex',
}
styles.ui.nestable = {
    flex: 1,
    display: 'flex',
}
styles.nestableComponent = {
    flex: '1',
}
styles.logo = {
    float: 'left',
    color: '#fff',
    margin: 0,
    fontWeight: 'normal',
    fontSize: '14pt',
    height: 60,
    overflow: 'hidden',
    marginRight: 50,
}
styles.layout = {}
styles.layout.header = {
    position: 'fixed',
    width: '100%',
    zIndex: 100,
}
styles.layout.content = {
    background: '#fff',
    marginTop: 65,
}
styles.layout.sider = {
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    color: '#ddd',
    position: 'fixed',
    top: 115,
    width: 450,
    height: 'calc(100vh - 115px)',
    overflow: 'auto',
    right: 0,
    borderLeft: '2px solid #666',
}

class Estimate extends React.Component {
    static propTypes = {
        match: PropTypes.any.isRequired, // eslint-disable-line
    }

    state = {
        title: 'A new project...',
        items: [],
        flatItems: [],
        flatItemsMap: {},
        collapsedItems: [],
        details: {},
        activeItem: null,
        isEditMode: false,
        focusOn: 'description',
        keyboardEvents: true,
    }

    componentWillMount () {
        loadFromBrowser(this)
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevProps.match.params.projectId !== this.props.match.params.projectId) {
            loadFromBrowser(this)
            return
        }
        if (prevState === this.state) {
            return
        }
        saveToBrowser(this)
    }

    componentDidMount () {
        document.addEventListener('keyup', (evt) => {
            if (this.state.keyboardEvents !== true) {
                return
            }

            switch (evt.key) {
                case 'ArrowUp': {
                    this.movePrev()
                    evt.preventDefault()
                    break
                }
                case 'ArrowDown': {
                    this.moveNext()
                    evt.preventDefault()
                    break
                }
                case 'Enter': {
                    if (evt.shiftKey) {
                        appendNewItem(this)
                    } else if (evt.altKey || evt.ctrlKey) {
                        injectNewItem(this)
                    } else if (this.state.isEditMode === false && this.state.activeItem !== null) {
                        this.setState({
                            isEditMode: true,
                            focusOn: 'description',
                        })
                    } else if (this.state.isEditMode === true) {
                        this.setState({
                            isEditMode: false,
                        })
                    } else {
                        tailNewItem(this)
                    }
                    break
                }
                case 'e': {
                    if (this.state.isEditMode === false && this.state.activeItem !== null) {
                        this.setState({
                            isEditMode: true,
                            focusOn: 'estimate',
                        })
                    }
                    break
                }
                case 'Escape': {
                    if (this.state.isEditMode) {
                        this.setState({ isEditMode: false })
                    } else if (this.state.activeItem !== null) {
                        this.selectItem(null)
                    }
                    break
                }
                case ' ': {
                    if (!this.state.isEditMode && this.state.activeItem) {
                        const node = this.state.flatItemsMap[this.state.activeItem]
                        if (this.hasChildren(this.state.activeItem)) {
                            this.toggleCollapse(node)
                        } else {
                            this.toggleStatus(node)
                        }
                    }
                    break
                }
                case '+':
                case 'a': {
                    if (!this.state.isEditMode) {
                        tailNewItem(this)
                    }
                    break
                }
                case 'Backspace': {
                    if (!this.state.isEditMode) {
                        this.deleteItem()
                    }
                    break
                }
                case 'd': {
                    if (!this.state.isEditMode) {
                        console.log(this.state) // eslint-disable-line
                    }
                    break
                }
                case 's': {
                    if (!this.state.isEditMode) {
                        saveToDisk(this)
                    }
                    break
                }
                case 'o': {
                    if (!this.state.isEditMode) {
                        loadFromDisk(this)
                    }
                    break
                }
                case 'n': {
                    if (!this.state.isEditMode) {
                        // eslint-disable-next-line
                        if (!confirm('Discard local changes and start a new project?')) {
                            return
                        }
                        // eslint-disable-next-line
                        const pname = prompt('Enter project name:')
                        if (pname) {
                            goToNewProject(pname)
                        } else {
                            alert('Please set a name for the project!') // eslint-disable-line
                        }
                    }
                    break
                }
                // case 'u': {
                //     // eslint-disable-next-line
                //     if (!confirm('Sure you want to reset items ids?')) { return }
                //     let id = 0
                //     const details = {}
                //     const { items } = this.state
                //     const change = nodes => nodes.map((node) => {
                //         id += 1
                //         details[id] = { ...this.state.details[node.id] }
                //         node.id = id // eslint-disable-line
                //         if (node.children) { change(node.children) }
                //         return node
                //     })
                //     change(items)
                //     this.updateStateWithItems([ ...items ], { details, collapsedItems: [] })
                //     break
                // }
                default: {
                    // console.log(evt.key) // eslint-disable-line
                } // eslint-disable-line
            }
        }, false)

        window.addEventListener('keydown', this.handleSpaceKeyboard, false)

        // init collapsed documents
        setTimeout(() => this.nestable.collapse(this.state.collapsedItems))
    }

    componentWillUnmount () {
        clearInterval(this.saveInterval)
        window.removeEventListener('keydown', this.handleSpaceKeyboard, false)
    }

    handleSpaceKeyboard = (e) => {
        if (e.keyCode !== 32) {
            return true
        }
        if ([
            'INPUT',
            'TEXTAREA',
        ].indexOf(e.target.nodeName) !== -1) {
            return true
        }

        e.preventDefault()
        return false
    }

    keyboardOff = () => this.setState({
        keyboardEvents: false,
    })

    keyboardOn = () => this.setState({
        keyboardEvents: true,
    })

    updateStateWithItems = (items, state = {}) => this.setState({
        ...state,
        items,
        flatItems: tree2array(items),
        flatItemsMap: tree2object(items),
    })

    changeTitle = (title) => {
        this.setState({ title })
        setTimeout(() => {
            saveToBrowser(this)
            setTimeout(() => updateProjectUrl(this))
        })
    }

    deleteItem = () => {
        // eslint-disable-next-line
        if (!confirm('remove it all?')) {
            return
        }

        const {
            details,
            flatItemsMap,
            activeItem,
            collapsedItems,
        } = this.state

        const node = flatItemsMap[activeItem]
        const subtree = tree2array(node.item.children)

        // remove from tree
        const items = treeDeleteNode(this.state.items, this.state.activeItem)
        delete details[node.id]

        for (const nodeId of subtree) {
            delete details[nodeId]
            const idx = collapsedItems.indexOf(nodeId)
            if (idx !== -1) {
                collapsedItems.splice(idx, 1)
            }
        }

        this.updateStateWithItems(items, {
            details,
            collapsedItems,
        })
    }

    hasChildren = (nodeId) => {
        const node = this.state.flatItemsMap[nodeId]
        if (!node.item.children) {
            return false
        }
        return node.item.children.length > 0
    }

    // define if it is inside a collapsed cone
    isVisible = (nodeId) => {
        const node = this.state.flatItemsMap[nodeId]
        if (!node) {
            return false
        }

        if (!node.parents) {
            return true
        }

        for (const parent of node.parents) {
            if (this.state.collapsedItems.indexOf(parent.id) !== -1) {
                return false
            }
        }

        return true
    }

    selectItem = (activeItem) => {
        if (this.state.activeItem === activeItem) {
            this.setState({ isEditMode: true })
        } else {
            this.setState({ activeItem })
        }
    }

    updateItemDetails = (itemId, details) => {
        this.setState({
            details: {
                ...this.state.details,
                [itemId]: details,
            },
        })
    }

    moveNext = () => {
        const { flatItems } = this.state
        let index = flatItems.indexOf(this.state.activeItem)
        let nextIndex = null
        let loopGuard = 0

        if (index === -1) {
            nextIndex = flatItems[0] // eslint-disable-line
        } else if (flatItems[index + 1]) {
            nextIndex = flatItems[index + 1]
        }

        while (loopGuard < 100 && this.isVisible(nextIndex) !== true) {
            index = flatItems.indexOf(nextIndex)
            if (index === -1) {
                nextIndex = flatItems[0] // eslint-disable-line
            } else if (flatItems[index + 1]) {
                nextIndex = flatItems[index + 1]
            }
            loopGuard += 1
        }

        this.selectItem(nextIndex)
    }

    movePrev = () => {
        const { flatItems, activeItem } = this.state
        let nextIndex = null
        let loopGuard = 0
        let index = flatItems.indexOf(activeItem)

        if (index === -1) {
            nextIndex = flatItems[flatItems.length - 1] // eslint-disable-line
        } else if (flatItems[index - 1]) {
            nextIndex = flatItems[index - 1]
        }

        while (loopGuard < 100 && this.isVisible(nextIndex) !== true) {
            index = flatItems.indexOf(nextIndex)
            if (index === -1) {
                nextIndex = flatItems[flatItems.length - 1] // eslint-disable-line
            } else if (flatItems[index - 1]) {
                nextIndex = flatItems[index - 1]
            }
            loopGuard += 1
        }

        this.selectItem(nextIndex)
    }

    toggleCollapse = (node) => {
        const collapsedItems = [ ...this.state.collapsedItems ]
        const index = this.state.collapsedItems.indexOf(node.id)
        if (index === -1) {
            collapsedItems.push(node.id)
        } else {
            collapsedItems.splice(index, 1)
        }
        this.setState({ collapsedItems })
        this.nestable.collapse(collapsedItems)
    }

    toggleStatus = (node) => {
        const details = this.state.details[node.id]
        this.setState({
            details: {
                ...this.state.details,
                [node.id]: {
                    ...details,
                    status: details.status ? false : true, // eslint-disable-line
                },
            },
        })
    }

    getTreeEstimate = tree => tree
        .map(node => this.getNodeEstimate(node.id))
        .reduce((a, b) => a + b, 0)

    getNodeEstimate = (nodeId) => {
        if (this.hasChildren(nodeId)) {
            return this.state.flatItemsMap[nodeId].item.children
                .reduce((acc, children) => acc + this.getNodeEstimate(children.id), 0)
        }

        if (this.state.details[nodeId].status) {
            return 0
        }

        return parseInt(this.state.details[nodeId].estimate, 10) || 0
    }

    updateDetailsField = fieldName => (evt) => {
        this.setState({
            details: {
                ...this.state.details,
                [this.state.activeItem]: {
                    ...this.state.details[this.state.activeItem],
                    [fieldName]: evt.target.value,
                },
            },
        })
    }

    renderItem = ({ item }) => (
        <EstimateItem
            id={item.id}
            details={this.state.details[item.id]}
            isActive={item.id === this.state.activeItem}
            isEditable={this.state.isEditMode}
            isLeafNode={!this.hasChildren(item.id)}
            focusOn={this.state.focusOn}
            estimate={this.getNodeEstimate(item.id)}
            isCollapsed={this.state.collapsedItems.indexOf(item.id) !== -1}
            onFocus={this.selectItem}
            onChange={this.updateItemDetails}
            onToggleCollapse={() => this.toggleCollapse(item)}
            onToggleStatus={() => this.toggleStatus(item)}
        />
    )

    render () {
        const { items } = this.state
        const contentStyle = this.state.activeItem
            ? { ...styles.layout.content, marginRight: styles.layout.sider.width }
            : styles.layout.content

        return (
            <Layout>
                <Layout.Header
                    style={styles.layout.header}
                >
                    <h1 style={styles.logo}>Discovery</h1>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        style={{ lineHeight: '64px' }}
                        onClick={(e) => {
                            switch (e.key) {
                                case '1': {
                                    tailNewItem(this)
                                    break
                                }
                                case '2': {
                                    saveToDisk(this)
                                    break
                                }
                                case '3': {
                                    loadFromDisk(this)
                                    break
                                }
                                case '4': {
                                    exportCsv(this)
                                    break
                                }
                                default: {} // eslint-disable-line
                            }
                        }}
                    >
                        <Menu.Item key="1">Add Item</Menu.Item>
                        <Menu.Item key="2">Save Project</Menu.Item>
                        <Menu.Item key="3">Open Project</Menu.Item>
                        <Menu.Item key="4">Export CSV</Menu.Item>
                    </Menu>
                </Layout.Header>
                <Layout.Content
                    style={contentStyle}
                >
                    <div style={styles.basics}>
                        <div style={styles.header}>
                            <ProjectTitle
                                value={this.state.title}
                                estimate={this.getTreeEstimate(this.state.items)}
                                onEditStart={this.keyboardOff}
                                onEditEnd={this.keyboardOn}
                                onChange={this.changeTitle}
                            />
                        </div>
                        <div style={styles.ui.wrapper}>
                            {items.length ? null : (
                                <div style={styles.welcome}>
                                    <p>Welcome to a new experience in discovering your requirements!</p>
                                    <p>Click "Add Item" (or just type "a") to add your first requirement.</p>
                                </div>
                            )}
                            <div style={styles.ui.nestable}>
                                <Nestable
                                    ref={(nestable) => { this.nestable = nestable }}
                                    items={items}
                                    renderItem={this.renderItem}
                                    onChange={this.updateStateWithItems}
                                    style={styles.nestableComponent}
                                />
                            </div>
                        </div>
                    </div>
                </Layout.Content>
                {this.state.activeItem ? (
                    <Layout.Sider
                        style={styles.layout.sider}
                        width={styles.layout.sider.width}
                    >
                        <Sidebar
                            {...this.state.details[this.state.activeItem]}
                            id={this.state.activeItem}
                            updateField={this.updateDetailsField}
                            onEditStart={this.keyboardOff}
                            onEditEnd={this.keyboardOn}
                        />
                    </Layout.Sider>
                ) : null}
            </Layout>
        )
    }
}

export default Estimate
