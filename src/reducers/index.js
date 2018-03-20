/* eslint global-require: off */

import { routerReducer as routing } from 'react-router-redux'

export default {
    app: require('./app-reducer').default,
    routing,
}
