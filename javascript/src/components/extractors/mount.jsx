import React from 'react';
import ExtractorExampleMessage from './ExtractorExampleMessage';
import AddExtractor from './AddExtractor';

const extractorExampleMessage = document.getElementById('react-extractor-example-message');
if (extractorExampleMessage) {
  const example = extractorExampleMessage.getAttribute('data-example');
  const field = extractorExampleMessage.getAttribute('data-field');
  React.render(<ExtractorExampleMessage field={field} example={example}/>, extractorExampleMessage);
}

const addExtractorElement = document.getElementById('react-add-extractor');
if (addExtractorElement) {
  const inputId = addExtractorElement.getAttribute('data-input-id');
  React.render(<AddExtractor inputId={inputId}/>, addExtractorElement);
}
