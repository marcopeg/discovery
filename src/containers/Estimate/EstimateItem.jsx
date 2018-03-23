/*
    eslint
        jsx-a11y/click-events-have-key-events: off,
        no-nested-ternary: off,
*/

import React from 'react'
import PropTypes from 'prop-types'

import EstimateItemLeaf from './EstimateItemLeaf'
import EstimateItemNode from './EstimateItemNode'

const EstimateItem = (props) => {
    const content = props.isLeafNode
        ? <EstimateItemLeaf {...props} />
        : <EstimateItemNode {...props} />

    return (
        <div
            onClick={() => props.onFocus(props.id)}
            className={
                props.isActive
                    ? props.isCompleted
                        ? 'estimate-row estimate-row--active-completed'
                        : 'estimate-row estimate-row--active'
                    : props.isCompleted
                        ? 'estimate-row estimate-row--completed'
                        : 'estimate-row estimate-row--normar'
            }
        >
            {content}
        </div>
    )
}

EstimateItem.propTypes = {
    id: PropTypes.number.isRequired,
    isLeafNode: PropTypes.bool.isRequired,
    isActive: PropTypes.bool.isRequired,
    isCompleted: PropTypes.bool.isRequired,
    isEditable: PropTypes.bool.isRequired,
    onFocus: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
    details: PropTypes.shape({
        status: PropTypes.bool.isRequired,
    }).isRequired,
}

export default EstimateItem
