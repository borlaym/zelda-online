'use strict';

describe('ZeldaOnlineApp', function () {
  var React = require('react/addons');
  var ZeldaOnlineApp, component;

  beforeEach(function () {
    var container = document.createElement('div');
    container.id = 'content';
    document.body.appendChild(container);

    ZeldaOnlineApp = require('components/ZeldaOnlineApp.js');
    component = React.createElement(ZeldaOnlineApp);
  });

  it('should create a new instance of ZeldaOnlineApp', function () {
    expect(component).toBeDefined();
  });
});
