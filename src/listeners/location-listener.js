
import createHistoryRouter from 'lib/redux-history-router'
import { LOCATION_CHANGE } from 'services/location-service'

const applyRoutes = createHistoryRouter([])

export default [{
    type: LOCATION_CHANGE,
    handler: action => (dispatch, getState) => applyRoutes(action.payload)(dispatch, getState),
}]
