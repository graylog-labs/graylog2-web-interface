import React, {Component, PropTypes} from 'react';
import {Row, Col, Button} from 'react-bootstrap';

import LoaderTabs from 'components/messageloaders/LoaderTabs';

class AddExtractor extends Component {
  static propTypes = {
    inputId: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this._showAddExtractorForm = this._showAddExtractorForm.bind(this);

    this.state = {
      showExtractorForm: false,
    };
  }

  _showAddExtractorForm() {
    this.setState({showExtractorForm: !this.state.showExtractorForm});
  }

  render() {
    let extractorForm;

    if (this.state.showExtractorForm) {
      extractorForm = (
        <div className="stream-loader">
          <LoaderTabs selectedInputId={this.props.inputId} />
        </div>
      );
    }

    return (
      <Row className="content">
        <Col md={12}>
          <h2 style={{marginBottom: 5}}>Add extractor</h2>

          <p>
            Start by loading a message to have an example to work on. You can decide whether to load a recent message
            received by this input, or manually select a message giving its ID.
          </p>
          <p>
            <Button bsStyle="info" bsSize="small" onClick={this._showAddExtractorForm} disabled={this.state.showExtractorForm}>
              Get started
            </Button>
          </p>

          {extractorForm}
        </Col>
      </Row>
    );
  }
}

export default AddExtractor;
