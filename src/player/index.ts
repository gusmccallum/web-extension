import '@/common/shared.scss';
import Vue from 'vue';
import Player from './Player.vue';
import store from '@/common/store';
import Ripple from 'vue-ripple-directive';
import MessengerApi from '@/common/api/MessengerApi';

console.log('INJECTED player/index.ts');

// Setup Globals

global.Api = MessengerApi;

global.onVideoChanged(video => {
  video.controls = false;
  video.autoplay = true;
});

// Clean DOM

const existingPlayers = document.querySelectorAll('#AnimeSkipPlayer');
if (existingPlayers.length > 0) {
  console.debug('Player already added, removing');
  existingPlayers.forEach(player => {
    player.remove();
  });
}

async function sleep(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms));
}

// Inject DOM

async function injectPlayer() {
  const rootQuery = global.getRootQuery();
  console.debug(`Adding player to ${rootQuery}`);

  while (document.querySelector(rootQuery) == null) {
    console.debug("Player's root node not found, trying again");
    await sleep(100);
  }
  console.debug(`Added player to ${rootQuery}`);

  // Set the style to hide all the old elements
  document.body.classList.add('hide-for-anime-skip');

  Ripple.color = 'rgba(255, 255, 255, 0.12)';
  Vue.directive('ripple', Ripple);
  Vue.config.productionTip = false;

  const vue = new Vue({
    store,
    render: h => h(Player),
  }).$mount();
  const parent = document.querySelector(rootQuery) as HTMLElement;
  parent.appendChild(vue.$el);
}

if (global.doNotReplacePlayer?.()) {
  console.info('Did not inject Anime Skip on purpose');
} else {
  injectPlayer();
}
