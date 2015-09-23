import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';

import Widget from 'components/widgets/Widget';

class Grid extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    widgets: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.instanceOf(Immutable.List)]),
    rowSize: PropTypes.number,
    columnSize: PropTypes.number,
  };

  static defaultProps = {
    rowSize: 200,
    columnSize: 410,
  };

  constructor(props) {
    super(props);

    this._formatWidget = this._formatWidget.bind(this);
    this._getWidgetStyle = this._getWidgetStyle.bind(this);
    this._determineWidgetPosition = this._determineWidgetPosition.bind(this);

    const viewportWidth = window.innerWidth;
    const sortedWidgets = this.props.widgets.sort(Grid._sortWidgets);

    this.state = {
      availableColumns: Math.floor(viewportWidth / props.columnSize),
      sortedWidgets: sortedWidgets,
    };
  }

  render() {
    const columns = Immutable.Range(0, this.state.availableColumns);

    // Table of occupied grid positions, indexed by column
    let occupiedPositionsInGrid = Immutable.List(columns.map(() => Immutable.Set()));

    let formattedWidgets = Immutable.List();
    let effectiveRow = 0;
    const maxRowValue = 2;

    for (let currentRow = 1; currentRow <= maxRowValue + 1; currentRow++) {
      const widgetsInRow = this.state.sortedWidgets.filter(widget => {
        // Draw unsorted widgets last, so we check if we are in the last iteration to filter them
        return (currentRow < maxRowValue + 1) ? widget.row === currentRow : widget.row === 0;
      });

      let effectiveRow = currentRow - 1;
      let effectiveColumn = 0;

      widgetsInRow.forEach(widget => {
        // TODO: check if widget fits in row (doesn't exceed number of columns), and reposition if needed
        // TODO: check if grid position is already taken, and reposition if it is
        const widgetPosition = this._determineWidgetPosition(occupiedPositionsInGrid, widget, effectiveRow, effectiveColumn);

        occupiedPositionsInGrid = Grid._occupyPositionInGrid(occupiedPositionsInGrid, widgetPosition);
        formattedWidgets = formattedWidgets.push(this._formatWidget(widget, widgetPosition));

        effectiveColumn++;
      }, this);
    }

    return (
      <div className="grid" style={{height: this.gridHeight}}>
        {formattedWidgets}
      </div>
    );
  }

  static _sortWidgets(widget1, widget2) {
    // Move widgets without a set position to the end of the list
    if (widget1.row === 0) return 1;
    if (widget2.row === 0) return -1;

    if (widget1.row !== widget2.row) {
      return widget1.row - widget2.row;
    }

    return widget1.col - widget2.col;
  }

  // Add widget's position to table of occupied cells in the grid
  static _occupyPositionInGrid(grid, widgetPosition) {
    let tempGrid = grid;

    // Go through the table and update each cell that the widget will occupy
    for (let i = 0; i < widgetPosition.width; i++) {
      let tempColumn = tempGrid.get(widgetPosition.column + i);

      for (let j = 0; j < widgetPosition.height; j++) {
        tempColumn = tempColumn.add(widgetPosition.row + j);
      }

      tempGrid = tempGrid.set(widgetPosition.column + i, tempColumn);
    }

    return tempGrid;
  }

  _determineWidgetPosition(grid, widget, desiredRow, desiredColumn) {
    let effectiveRow = desiredRow;
    let effectiveColumn = desiredColumn;
    while (Grid._isOccupied(grid, effectiveRow, effectiveColumn)) {
      if (effectiveColumn + widget.width + 1 < this.state.availableColumns) {
        effectiveColumn++;
      } else {
        effectiveRow++;
        effectiveColumn = 0;
      }
    }

    return {
      row: effectiveRow,
      column: effectiveColumn,
      width: widget.width,
      height: widget.height,
    };
  }

  static _isOccupied(grid, row, column) {
    return grid.get(column) !== undefined && grid.get(column).has(row);
  }

  _formatWidget(widget, widgetPosition) {
    console.log(widget);
    return (
      <div key={widget.id} className="widget-container" style={this._getWidgetStyle(widgetPosition)}>
        <Widget dashboardId={this.props.id} widgetId={widget.id}/>
      </div>
    );
  }

  _getWidgetStyle(widgetPosition) {
    return {
      width: this.props.columnSize * widgetPosition.width,
      height: this.props.rowSize * widgetPosition.height,
      left: this.props.columnSize * widgetPosition.column,
      top: this.props.rowSize * widgetPosition.row,
    };
  }

}

export default Grid;
