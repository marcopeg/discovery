/*
    eslint
        react/prefer-stateless-function: off,
*/

import React from 'react'
// import request from 'lib/request'
import { history } from '../index'

class InitProject extends React.Component {
    async componentDidMount () {
        const projectId = `p${Date.now()}`
        const projectData = {
            title: 'New Discovery Project',
            items: [],
            details: {},
            activeItem: null,
            collapsedItems: [],
            etag: Date.now(),
        }

        localStorage.setItem(projectId, JSON.stringify(projectData))
        history.push(`/${projectId}`)
    }

    render () {
        return (
            <div>
                Init project...
            </div>
        )
    }
}

export default InitProject
