const { CloudHost } = require('./constants');

class Api {
  constructor(_options = {}) {
    this._options = _options;
    this._fetch = this._options.fetch || fetch.bind(window);
  }

  _buildUrl(method) {
    const protocol = this._options.secure ? 'https://' : 'http://';
    let url =
      protocol +
      this._options.host +
      ':' +
      this._options.port +
      this._options.path +
      this._options.key +
      '/' +
      method;
    const queryString = '?ts=' + new Date().getTime() + '' + Math.random();
    url += queryString;

    return url;
  }

  /** Get a unique ID from the server via XHR and initialize with it. */
  async retrieveId() {
    const url = this._buildUrl('id');

    try {
      const response = await this._fetch(url);

      if (response.status !== 200) {
        throw new Error(`Error. Status:${response.status}`);
      }

      return response.text();
    } catch (error) {
      console.error('Error retrieving ID', error);

      let pathError = '';

      if (this._options.path === '/' && this._options.host !== CloudHost) {
        pathError =
          ' If you passed in a `path` to your self-hosted PeerServer, ' +
          "you'll also need to pass in that same path when creating a new " +
          'Peer.';
      }

      throw new Error('Could not get an ID from the server.' + pathError);
    }
  }
}

module.exports = Api;
