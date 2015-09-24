import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';

import Widget from 'components/widgets/Widget';

class Grid extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    widgets: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.instanceOf(Immutable.List)]),
    rowSize: PropTypes.number,
    columnSize: PropTypes.number,
    margin: PropTypes.number,
  };

  static defaultProps = {
    rowSize: 200,
    columnSize: 400,
    margin: 10,
  };

  constructor(props) {
    super(props);

    this._formatWidget = this._formatWidget.bind(this);
    this._getWidgetStyle = this._getWidgetStyle.bind(this);
    this._determineWidgetPosition = this._determineWidgetPosition.bind(this);

    const viewportWidth = window.innerWidth;
    const arrangedWidgets = this.props.widgets.filter(widget => widget.row !== 0).sort(Grid._sortWidgets);
    const disarrangedWidgets = this.props.widgets.filter(widget => widget.row === 0);

    this.state = {
      availableColumns: Math.floor(viewportWidth / props.columnSize),
      arrangedWidgets: arrangedWidgets,
      disarrangedWidgets: disarrangedWidgets,
      totalColumnSize: this.props.columnSize + this.props.margin,
      totalRowSize: this.props.rowSize + this.props.margin,
    };
  }

  render() {
    const columns = Immutable.Range(0, this.state.availableColumns);

    // Table of occupied grid positions, indexed by column
    let occupiedPositionsInGrid = Immutable.List(columns.map(() => Immutable.Set()));

    let formattedWidgets = Immutable.List();

    let gridRow = 0;
    let gridColumn = 0;

    let widgetRow = 1;

    // Position all arranged widgets first
    for (let widgetIndex = 0; widgetIndex < this.state.arrangedWidgets.count(); widgetIndex++) {
      const widget = this.state.arrangedWidgets.get(widgetIndex);

      // Reset column index and increase row index when widget is in a different row
      if (widgetRow !== widget.row) {
        widgetRow = widget.row;
        gridRow = (widgetIndex === 0) ? 0 : gridRow + 1;
        gridColumn = 0;
      }

      const widgetPosition = this._determineWidgetPosition(occupiedPositionsInGrid, widget, gridRow, gridColumn);
      occupiedPositionsInGrid = Grid._occupyPositionInGrid(occupiedPositionsInGrid, widgetPosition);
      formattedWidgets = formattedWidgets.push(this._formatWidget(widget, widgetPosition));

      gridColumn = widgetPosition.column + widgetPosition.width;
    }

    // Place not arranged widgets in a new row
    gridRow++;
    gridColumn = 0;

    // Position not arranged widgets
    for (let widgetIndex = 0; widgetIndex < this.state.disarrangedWidgets.count(); widgetIndex++) {
      const widget = this.state.disarrangedWidgets.get(widgetIndex);

      const widgetPosition = this._determineWidgetPosition(occupiedPositionsInGrid, widget, gridRow, gridColumn);
      occupiedPositionsInGrid = Grid._occupyPositionInGrid(occupiedPositionsInGrid, widgetPosition);
      formattedWidgets = formattedWidgets.push(this._formatWidget(widget, widgetPosition));

      gridRow = widgetPosition.row;
      gridColumn = widgetPosition.column + widgetPosition.width;
    }

    const totalRows = occupiedPositionsInGrid.map(column => column.max() || 0).max() + 1;
    return (
      <div className="grid" style={{height: totalRows * this.state.totalRowSize}}>
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
    while (Grid._areCellsOccupied(grid, effectiveRow, effectiveRow + widget.height - 1, effectiveColumn, effectiveColumn + widget.width - 1)) {
      if (effectiveColumn + widget.width < this.state.availableColumns) {
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

  static _areCellsOccupied(grid, beginRow, endRow, beginColumn, endColumn) {
    for (let i = beginRow; i <= endRow; i++) {
      for (let j = beginColumn; j <= endColumn; j++) {
        if (this._isOccupied(grid, i, j)) {
          return true;
        }
      }
    }

    return false;
  }

  static _isOccupied(grid, row, column) {
    return grid.get(column) === undefined || grid.get(column).has(row);
  }

  _formatWidget(widget, widgetPosition) {
    return (
      <div key={widget.id} className="widget-container" style={this._getWidgetStyle(widgetPosition)}>
        <Widget dashboardId={this.props.id} widgetId={widget.id}/>
      </div>
    );
  }

  _getWidgetStyle(widgetPosition) {
    return {
      width: this.props.columnSize * widgetPosition.width + (this.props.margin * (widgetPosition.width - 1)),
      height: this.props.rowSize * widgetPosition.height + (this.props.margin * (widgetPosition.height - 1)),
      left: this.state.totalColumnSize * widgetPosition.column,
      top: this.state.totalRowSize * widgetPosition.row,
    };
  }

}

export default Grid;
