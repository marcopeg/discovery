/*
    eslint
        react/prefer-stateless-function: off,
*/

import React from 'react'
import request from 'lib/request'
import { history } from '../index'

class InitProject extends React.Component {
    async componentDidMount () {
        const res = await request('https://api.myjson.com/bins', {
            method: 'POST',
            headers: {
                'content-type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                title: 'New Discovery Project',
                items: [],
                details: {},
                activeItem: null,
                collapsedItems: [],
            }),
        })
        const body = await res.json()
        const tokens = body.uri.split('/')
        history.push(`/${tokens[tokens.length - 1]}`)
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
