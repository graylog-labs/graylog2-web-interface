const React = require('react');
const GettingStarted = require('./GettingStarted');

const elem = document.getElementById('react-gettingstarted');
if (elem) {
  const clusterId = elem.getAttribute('data-cluster-id');
  const masterOs = elem.getAttribute('data-master-os');
  const masterVersion = elem.getAttribute('data-master-version');
  const gettingStartedUrl = elem.getAttribute('data-getting-started-url');
  const noButton = elem.getAttribute('data-no-button') === 'true';
  React.render(<GettingStarted clusterId={clusterId}
                               masterOs={masterOs}
                               masterVersion={masterVersion}
                               gettingStartedUrl={gettingStartedUrl}
                               noButton={noButton} />, elem);
}
