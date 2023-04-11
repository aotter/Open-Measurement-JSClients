goog.module('omid.creatives.OmidCreativeSessionMain');

const OmidCreativeSession = goog.require('omid.creatives.OmidCreativeSession');

const omidSession = OmidCreativeSession.main(window.TREK_OM_RES);
omidSession.setCreativeType('htmlDisplay');
omidSession.setImpressionType('loaded');
omidSession.loaded();
omidSession.impressionOccurred();
