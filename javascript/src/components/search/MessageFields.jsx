import React, {Component, PropTypes} from 'react';
import Immutable from 'immutable';
import MessageFieldDescription from './MessageFieldDescription';

const SPECIAL_FIELDS = ['full_message', 'level'];

class MessageFields extends Component {
  static propTypes = {
    message: PropTypes.object.isRequired,
    possiblyHighlight: PropTypes.func.isRequired,
    disableFieldActions: PropTypes.bool,
  };

  render() {
    const fields = [];
    const formattedFields = Immutable.Map(this.props.message.formatted_fields).sortBy((value, key) => key, (fieldA, fieldB) => fieldA.localeCompare(fieldB));
    formattedFields.forEach((value, key) => {
      let innerValue = value;
      if (SPECIAL_FIELDS.indexOf(key) !== -1) {
        innerValue = this.props.message.fields[key];
      }
      fields.push(<dt key={key + 'Title'}>{key}</dt>);
      fields.push(<MessageFieldDescription key={key + 'Description'}
                                           message={this.props.message}
                                           fieldName={key}
                                           fieldValue={innerValue}
                                           possiblyHighlight={this.props.possiblyHighlight}
                                           disableFieldActions={this.props.disableFieldActions}/>);
    });

    return (
      <dl className="message-details message-details-fields">
        {fields}
      </dl>
    );
  }
}

export default MessageFields;
