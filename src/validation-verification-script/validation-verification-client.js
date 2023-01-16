goog.module('omid.validationVerificationScript.ValidationVerificationClient');
const {packageExport} = goog.require('omid.common.exporter');
const {AdEventType} = goog.require('omid.common.constants');
const VerificationClient = goog.require(
  'omid.verificationClient.VerificationClient'
);
const {isTopWindowAccessible, removeDomElements, resolveGlobalContext} =
  goog.require('omid.common.windowUtils');
/** @const {string} the default address for the logs.*/
const DefaultLogServer = 'https://c3po.aotter.net/om-evt';

/**
 * OMID ValidationVerificationClient.
 * Simple validation script example.
 * The script creates VerificationClient instance and register to the OMID events.
 * The script fires logs for every event that is received by the OMID.
 */
class ValidationVerificationClient {
  /**
   * Simple ValidationVerificationClient
   *  - log if support is true
   *  - register to sessionObserver
   *  - register a callback to all AdEventType, except additional registration to media events
   * @param {VerificationClient} verificationClient instance for communication with OMID server
   * @param {string} vendorKey - should be the same when calling sessionStart in order to get verificationParameters
   */
  constructor(verificationClient, vendorKey) {
    /** @private {VerificationClient} */
    this.verificationClient_ = verificationClient;
    const isSupported = this.verificationClient_.isSupported();
    if (isSupported) {
      this.verificationClient_.registerSessionObserver(() => {}, vendorKey);
      this.verificationClient_.addEventListener(
        AdEventType.GEOMETRY_CHANGE,
        (event) => this.omidEventListenerCallback_(event)
      );

      this.verificationClient_.addEventListener(
        AdEventType.IMPRESSION,
        (event) => this.omidEventListenerCallback_(event)
      );
    }

    this.timer = null;
    this.isSendFirstImpression = false;
    this.isSendSecondImpression = false;
  }

  /**
   * Log message to the server
   * Message will have the format: <Date> :: <Message>
   * For example: 10/8/2017, 10:41:11 AM::"OmidSupported[true]"
   * @param {Object|string} message to send to the server
   * @param {number} timestamp of the event
   */
  logMessage_(message) {
    const log = JSON.stringify(message);
    console.log(log);
    this.sendUrl_(log);
  }

  /**
   * Call verificationClient sendUrl for message with the correct logServer
   * @param {string} message to send to the server
   */
  sendUrl_(message) {
    const url = DefaultLogServer + '?event=' + encodeURIComponent(message);
    this.verificationClient_.sendUrl(url);
  }

  /**
   * Callback for addEventListener.
   * Sending event logs to the server
   * @param {Object} event data
   */
  omidEventListenerCallback_(event) {
    event = removeDomElements(event);

    switch (event.type) {
      case AdEventType.IMPRESSION:
        {
          if (!this.isSendFirstImpression) {
            this.logMessage_(
              Object.assign({session: 'firstImpression', event})
            );
            this.isSendFirstImpression = true;
          }
        }
        break;
      case AdEventType.GEOMETRY_CHANGE:
        {
          if (this.isSendFirstImpression && !this.isSendSecondImpression) {
            const {percentageInView = 0} = event.data.adView;

            this.timer && clearTimeout(this.timer);

            if (percentageInView >= 50 && percentageInView <= 100) {
              this.timer = setTimeout(() => {
                this.logMessage_(
                  Object.assign({session: 'secondImpression', event})
                );
                this.isSendSecondImpression = true;
                this.timer && clearTimeout(this.timer);
              }, 1000);
            }
          }
        }
        break;
      default:
        break;
    }
  }
}
exports = ValidationVerificationClient;
