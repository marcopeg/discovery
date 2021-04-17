/*
    eslint
        react/prefer-stateless-function: off,
        react/prop-types: off,
        no-undef: off,
        no-empty: off,
        no-unused-vars: off,
*/

import React from 'react'
import Estimate from 'containers/Estimate'
import { history } from '../index'

class InitProject extends React.Component {
    state = {
        isReady: false,
    }

    async componentDidMount () {
        const { projectId } = this.props.match.params
        try {
            const data = localStorage.getItem(projectId)
            if (data) {
                JSON.parse(data)
                this.setState({ isReady: true })
            } else {
                throw new Error('project not found')
            }
        } catch (e) {
            alert('Project not found')
            console.error(e)
            localStorage.removeItem(projectId)
            history.push(`/`)
        }
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
