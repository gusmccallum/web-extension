const manifest = {
  ...require('./manifest.json'),
  version: require('../package.json').version,
};

const services = [
  {
    folder: 'example',
    matches: ['file:///*/example/index.html'],
  },
  {
    folder: 'vrv',
    matches: ['https://static.vrv.co/*'],
  },
  {
    folder: 'funimation',
    matches: ['https://www.funimation.com/*'],
  },
];

services.forEach(service => {
  // Keyboard blocker for each service
  manifest.content_scripts.push({
    matches: service.matches,
    js: ['content-scripts/keyboard-blocker.js'],
    run_at: 'document_start',
    all_frames: true,
  });

  // Player for each service
  manifest.content_scripts.push({
    matches: service.matches,
    js: [
      'browser-polyfill.js',
      'content-scripts/all.js',
      `content-scripts/${service.folder}/index.js`,
      'player/index.js',
    ],
    css: ['player/index.css', `content-scripts/${service.folder}/index.css`],
    all_frames: true,
  });
});

module.exports = manifest;
