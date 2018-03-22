/*
    eslint
        react/prefer-stateless-function: off,
        react/prop-types: off,
        no-undef: off,
        no-empty: off,
        no-unused-vars: off,
*/

import React from 'react'
import request from 'lib/request'
import Estimate from 'containers/Estimate'
import { history } from '../index'

class InitProject extends React.Component {
    state = {
        isReady: false,
    }

    async componentWillMount () {
        const { projectId } = this.props.match.params
        let projectExists = false
        let projectData = null
        try {
            const data = localStorage.getItem(projectId)
            if (data) {
                projectData = JSON.parse(data)
                projectExists = true
                this.setState({ isReady: true })
            }
        } catch (e) {
            console.error('Project was removed')
            console.error(e)
            localStorage.removeItem(projectId)
        }

        const res = await request(`https://api.myjson.com/bins/${projectId}`, {
            method: 'GET',
        })
        const body = await res.json()
        if (!projectExists) {
            localStorage.setItem(projectId, JSON.stringify(body))
            this.setState({ isReady: true })
            return
        }

        try {
            if (
                body.etag > projectData.etag &&
                confirm('The local copy of the project differs from the online. Do you want to use the online version?') // eslint-disable-line
            ) {
                localStorage.setItem(projectId, JSON.stringify(body))
                window.location.reload(true)
            }
        } catch(e) {} // eslint-disable-line

    }

    render () {
        if (this.state.isReady) {
            return <Estimate projectId={this.props.match.params.projectId} />
        }

        return (
            <div>
                Loading project...
            </div>
        )
    }
}

export default InitProject
