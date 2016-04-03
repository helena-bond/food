module.exports = function(shipit) {
  require('shipit-deploy')(shipit);
  require('shipit-npm')(shipit);

  shipit.initConfig({
    default: {
      workspace: '/tmp/deploy/',
      deployTo: '/home/deploy/apps/api/',
      repositoryUrl: 'https://github.com/helena-bond/food.git',
      keepReleases: 2,
      deleteOnRollback: true,
      shallowClone: true,
    },
    production: {
      servers: 'deploy@utu-food-iot.me',
    },
  });

  shipit.blTask('forever:stop', function() {
    shipit.log('Stopping forever...');

    return shipit.remote('forever stop food-api').then(function () {
      shipit.log('Forever stopped!');
    });
  });

  shipit.blTask('forever:start', function() {
    var foreverCommand = 'forever start ' + shipit.currentPath + 'forever.json';
    shipit.log('Starting forever...');
    assert.strictEqual(typeof(shipit.currentPath), 'string', 'Deploy directory undefined!');

    return shipit.remote(foreverCommand).then(function () {
      shipit.log('Forever started!');
    });
  });


  shipit.on('deploy:finish', function() {
    shipit.start('forever:stop', 'forever:start');
  });
};
