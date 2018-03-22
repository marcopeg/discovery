/*
    eslint
        react/prefer-stateless-function: off,
        no-unused-expressions: off,
        react/sort-comp: off,
        no-restricted-syntax: off,
        react/jsx-curly-brace-presence: off,
*//* global document window */

import React from 'react'
import PropTypes from 'prop-types'
import Nestable from 'react-nestable'
import { Layout, Menu, Icon } from 'antd'

import {
    loadFromBrowser,
    saveToBrowser,
    saveToDisk,
    loadFromDisk,
    updateProjectUrl,
    exportCsv,
    goToNewProject,
    saveProject,
} from './utils/storage'

import {
    tailNewItem,
    appendNewItem,
    injectNewItem,
} from './utils/new-items'

import {
    up as navigateUp,
    down as navigateDown,
    left as navigateLeft,
    right as navigateRight,
} from './utils/navigate'

import { string2minutes } from './utils/minutes'

import { archiveCompleted } from './utils/archive-completed'
import { deleteActiveItem } from './utils/delete-item'

import tree2array from './utils/tree2array'
import tree2object from './utils/tree2object'
import EstimateItem from './EstimateItem'
import ProjectTitle from './ProjectTitle'
import Sidebar from './Sidebar'

import './estimate.css'
import styles from './Estimate.styles'

class Estimate extends React.Component {
    static propTypes = {
        projectId: PropTypes.string.isRequired,
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
        if (prevProps.projectId !== this.props.projectId) {
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
                    evt.preventDefault()
                    navigateUp(this)
                    break
                }
                case 'ArrowDown': {
                    evt.preventDefault()
                    navigateDown(this)
                    break
                }
                case 'ArrowLeft': {
                    if (!this.state.isEditMode) {
                        evt.preventDefault()
                        navigateLeft(this)
                    }
                    break
                }
                case 'ArrowRight': {
                    if (!this.state.isEditMode) {
                        evt.preventDefault()
                        navigateRight(this)
                    }
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
                        deleteActiveItem(this)
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
                        saveProject(this)
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
                        if (!confirm('Do you want to create a new project?')) {
                            return
                        }
                        goToNewProject()
                    }
                    break
                }
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

    updateStateWithItems = (items, state = {}) => {
        this.setState({
            ...state,
            items,
            flatItems: tree2array(items),
            flatItemsMap: tree2object(items),
        })
        setTimeout(() => this.nestable.collapse(this.state.collapsedItems))
    }

    changeTitle = title => this.setState({ title })

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
            const total = this.state.flatItemsMap[nodeId].item.children
                .reduce((acc, children) => acc + this.getNodeEstimate(children.id), 0)

            return total || string2minutes(this.state.details[nodeId].estimate)
        }

        if (this.state.details[nodeId].status) {
            return 0
        }

        return string2minutes(this.state.details[nodeId].estimate) || 0
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
                <Layout.Sider
                    style={styles.layout.leftSider}
                >
                    <h1 style={styles.logo}>Discovery</h1>
                    <Menu
                        selectable={false}
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
                                    archiveCompleted(this)
                                    break
                                }
                                case '3': {
                                    saveProject(this)
                                    break
                                }
                                case '4': {
                                    loadFromDisk(this)
                                    break
                                }
                                case '5': {
                                    saveToDisk(this)
                                    break
                                }
                                case '6': {
                                    exportCsv(this)
                                    break
                                }
                                default: { } // eslint-disable-line
                            }
                        }}
                    >
                        <Menu.Item key="1" alt="add item"><Icon type="plus-square" /> New Item</Menu.Item>
                        <Menu.Item key="2" alt="add item"><Icon type="check" /> Archive Completed</Menu.Item>
                        <Menu.Item key="3"><Icon type="save" /> Save Project</Menu.Item>
                        <Menu.Item key="4"><Icon type="upload" /> Import Project</Menu.Item>
                        <Menu.Item key="5"><Icon type="download" /> Export JSON</Menu.Item>
                        <Menu.Item key="6"><Icon type="download" /> Export CSV</Menu.Item>
                    </Menu>
                </Layout.Sider>
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
                                    <p>{'Welcome to a new experience in discovering your requirements!'}</p>
                                    <p>{'Click "Add Item" (or just type "a") to add your first requirement.'}</p>
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
