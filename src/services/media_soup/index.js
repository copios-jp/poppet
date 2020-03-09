import * as mediasoup from 'mediasoup-client';
import {uuidv4} from '../../util';
import debugModule from 'debug';

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const log = debugModule('poppet');
const warn = debugModule('poppet:WARN');
const err = debugModule('poppet:ERROR');
export const myPeerId = uuidv4();

export let device,
  joined,
  localCam,
  localScreen,
  recvTransport,
  sendTransport,
  camVideoProducer,
  camAudioProducer,
  screenVideoProducer,
  screenAudioProducer,
  currentActiveSpeaker = {},
  lastPollSyncData = {},
  consumers = [],
  pollingInterval;

export async function main() {
  log(`starting up ... my peerId is ${myPeerId}`);
  try {
    device = new mediasoup.Device();
  } catch (e) {
    if (e.name === 'UnsupportedError') {
      console.error('browser not supported for video calls');
      return;
    } else {
      console.error(e);
    }
  }

  // use sendBeacon to tell the server we're disconnecting when
  // the page unloads
  window.addEventListener('unload', () => sig('leave', {}, true));
}

export async function joinRoom() {
  if (joined) {
    return;
  }

  log('join room');
  $('#join-control').style.display = 'none';

  try {
    // signal that we're a new peer and initialize our
    // mediasoup-client device, if this is our first time connecting
    let {routerRtpCapabilities} = await sig('join-as-new-peer');
    if (!device.loaded) {
      await device.load({routerRtpCapabilities});
    }
    joined = true;
    $('#leave-room').style.display = 'initial';
  } catch (e) {
    console.error(e);
    return;
  }

  // super-simple signaling: let's poll at 1-second intervals
  pollingInterval = setInterval(async () => {
    let {error} = await pollAndUpdate();
    if (error) {
      clearInterval(pollingInterval);
      err(error);
    }
  }, 1000);
}

function removeVideoAudio(consumer) {
  document.querySelectorAll(consumer.kind).forEach(v => {
    if (v.consumer === consumer) {
      v.parentNode.removeChild(v);
    }
  });
}
async function closeConsumer(consumer) {
  if (!consumer) {
    return;
  }
  log('closing consumer', consumer.appData.peerId, consumer.appData.mediaTag);
  try {
    // tell the server we're closing this consumer. (the server-side
    // consumer may have been closed already, but that's okay.)
    await sig('close-consumer', {consumerId: consumer.id});
    await consumer.close();

    consumers = consumers.filter(c => c !== consumer);
    removeVideoAudio(consumer);
  } catch (e) {
    console.error(e);
  }
}

async function pollAndUpdate() {
  let {peers, activeSpeaker, error} = await sig('sync');
  if (error) {
    return {error};
  }

  // always update bandwidth stats and active speaker display
  currentActiveSpeaker = activeSpeaker;
  /*
  updateActiveSpeaker();
  updateCamVideoProducerStatsDisplay();
  updateScreenVideoProducerStatsDisplay();
  updateConsumersStatsDisplay();
  */

  // decide if we need to update tracks list and video/audio
  // elements. build list of peers, sorted by join time, removing last
  // seen time and stats, so we can easily do a deep-equals
  // comparison. compare this list with the cached list from last
  // poll.
  /*
  let thisPeersList = sortPeers(peers),
      lastPeersList = sortPeers(lastPollSyncData);
  if (!deepEqual(thisPeersList, lastPeersList)) {
    updatePeersDisplay(peers, thisPeersList);
  }
*/
  // if a peer has gone away, we need to close all consumers we have
  // for that peer and remove video and audio elements
  for (let id in lastPollSyncData) {
    if (!peers[id]) {
      log(`peer ${id} has exited`);
      consumers.forEach(consumer => {
        if (consumer.appData.peerId === id) {
          closeConsumer(consumer);
        }
      });
    }
  }

  // if a peer has stopped sending media that we are consuming, we
  // need to close the consumer and remove video and audio elements
  consumers.forEach(consumer => {
    let {peerId, mediaTag} = consumer.appData;
    if (!peers[peerId].media[mediaTag]) {
      log(`peer ${peerId} has stopped transmitting ${mediaTag}`);
      closeConsumer(consumer);
    }
  });

  lastPollSyncData = peers;
  return {}; // return an empty object if there isn't an error
}

export async function sig(endpoint, data, beacon) {
  try {
    let headers = {'Content-Type': 'application/json'},
      body = JSON.stringify({...data, peerId: myPeerId});

    if (beacon) {
      navigator.sendBeacon('/signaling/' + endpoint, body);
      return null;
    }

    let response = await fetch('/signaling/' + endpoint, {
      method: 'POST',
      body,
      headers,
    });
    return await response.json();
  } catch (e) {
    console.error(e);
    return {error: e};
  }
}
/* PRAGMA UI Updates */
function updateActiveSpeaker() {
  $$('.track-subscribe').forEach(el => {
    el.classList.remove('active-speaker');
  });
  if (currentActiveSpeaker.peerId) {
    $$(`.track-subscribe-${currentActiveSpeaker.peerId}`).forEach(el => {
      el.classList.add('active-speaker');
    });
  }
}

function updateCamVideoProducerStatsDisplay() {
  /*
  let tracksEl = $('#camera-producer-stats');
  tracksEl.innerHTML = '';
  if (!camVideoProducer || camVideoProducer.paused) {
    return;
  }
  makeProducerTrackSelector({
    internalTag: 'local-cam-tracks',
    container: tracksEl,
    peerId: myPeerId,
    producerId: camVideoProducer.id,
    currentLayer: camVideoProducer.maxSpatialLayer,
    layerSwitchFunc: (i) => {
      console.log('client set layers for cam stream');
      camVideoProducer.setMaxSpatialLayer(i) }
  });
  */
}

function updateScreenVideoProducerStatsDisplay() {
  /*
  let tracksEl = $('#screen-producer-stats');
  tracksEl.innerHTML = '';
  if (!screenVideoProducer || screenVideoProducer.paused) {
    return;
  }
  makeProducerTrackSelector({
    internalTag: 'local-screen-tracks',
    container: tracksEl,
    peerId: myPeerId,
    producerId: screenVideoProducer.id,
    currentLayer: screenVideoProducer.maxSpatialLayer,
    layerSwitchFunc: (i) => {
      console.log('client set layers for screen stream');
      screenVideoProducer.setMaxSpatialLayer(i) }
  });
  */
}

function updateConsumersStatsDisplay() {
  /*
  try {
    for (let consumer of consumers) {
      let label = $(`#consumer-stats-${consumer.id}`);
      if (label) {
        if (consumer.paused) {
          label.innerHTML = '(consumer paused)'
        } else {
          let stats = lastPollSyncData[myPeerId].stats[consumer.id],
              bitrate = '-';
          if (stats) {
            bitrate = Math.floor(stats.bitrate / 1000.0);
          }
          label.innerHTML = `[consumer playing ${bitrate} kb/s]`;
        }
      }

      let mediaInfo = lastPollSyncData[consumer.appData.peerId] &&
                      lastPollSyncData[consumer.appData.peerId]
                        .media[consumer.appData.mediaTag];
      if (mediaInfo && !mediaInfo.paused) {
        let tracksEl = $(`#track-ctrl-${consumer.producerId}`);
        if (tracksEl && lastPollSyncData[myPeerId]
                               .consumerLayers[consumer.id]) {
          tracksEl.innerHTML = '';
          let currentLayer = lastPollSyncData[myPeerId]
                               .consumerLayers[consumer.id].currentLayer;
          makeProducerTrackSelector({
            internalTag: consumer.id,
            container: tracksEl,
            peerId: consumer.appData.peerId,
            producerId: consumer.producerId,
            currentLayer: currentLayer,
            layerSwitchFunc: (i) => {
              console.log('ask server to set layers');
              sig('consumer-set-layers', { consumerId: consumer.id,
                                           spatialLayer: i });
            }
          });
        }
      }
    }
  } catch (e) {
    log('error while updating consumers stats display', e);
  }
  */
}

function makeProducerTrackSelector({
  internalTag,
  container,
  peerId,
  producerId,
  currentLayer,
  layerSwitchFunc,
}) {
  /*
  try {
    let pollStats = lastPollSyncData[peerId] &&
                    lastPollSyncData[peerId].stats[producerId];
    if (!pollStats) {
      return;
    }

    let stats = [...Array.from(pollStats)]
                  .sort((a,b) => a.rid > b.rid ? 1 : (a.rid<b.rid ? -1 : 0));
    let i=0;
    for (let s of stats) {
      let div = document.createElement('div'),
          radio = document.createElement('input'),
          label = document.createElement('label'),
          x = i;
      radio.type = 'radio';
      radio.name = `radio-${internalTag}-${producerId}`;
      radio.checked = currentLayer == undefined ?
                          (i === stats.length-1) :
                          (i === currentLayer);
      radio.onchange = () => layerSwitchFunc(x);
      let bitrate = Math.floor(s.bitrate / 1000);
      label.innerHTML = `${bitrate} kb/s`;
      div.appendChild(radio);
      div.appendChild(label);
      container.appendChild(div);
      i++;
    }
    if (i) {
      let txt = document.createElement('div');
      txt.innerHTML = 'tracks';
      container.insertBefore(txt, container.firstChild);
    }
  } catch (e) {
    log('error while updating track stats display', e);
  }
  */
}

//
// encodings for outgoing video
//

// just two resolutions, for now, as chrome 75 seems to ignore more
// than two encodings
//
const CAM_VIDEO_SIMULCAST_ENCODINGS = [
  {maxBitrate: 96000, scaleResolutionDownBy: 4},
  {maxBitrate: 680000, scaleResolutionDownBy: 1},
];

function camEncodings() {
  return CAM_VIDEO_SIMULCAST_ENCODINGS;
}

// how do we limit bandwidth for screen share streams?
//
function screenshareEncodings() {}

export default {
  main,
};
