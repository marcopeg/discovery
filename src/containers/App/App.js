/*
    eslint
        jsx-a11y/anchor-is-valid: off
*/

import React from 'react'
import { Route } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import LoadProject from 'containers/LoadProject'
import InitProject from 'containers/InitProject'

// import logo from './logo.svg'
import './App.css'

const App = () => (
    <div className="App">
        <Helmet>
            <html lang="en" />
            <title>[cra-ssr] server side rendering for create react app</title>
        </Helmet>
        <Route exact path="/" component={InitProject} />
        <Route path="/:projectId" component={LoadProject} />
    </div>
)

export default App
