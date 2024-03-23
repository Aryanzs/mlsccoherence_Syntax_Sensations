const axios = require('axios');

class InstagramBasicDisplayAPI {
  constructor(params) {
    this.appId = process.env.INSTAGRAM_APP_ID; // You should set your Instagram app ID as an environment variable
    this.appSecret = process.env.INSTAGRAM_APP_SECRET; // You should set your Instagram app secret as an environment variable
    this.redirectUrl = process.env.INSTAGRAM_APP_REDIRECT_URI; // You should set your Instagram redirect URI as an environment variable
    this.getCode = params.get_code;
    this.apiBaseUrl = 'https://api.instagram.com/';
    this.graphBaseUrl = 'https://graph.instagram.com/';
    this.userAccessToken = '';
    this.userAccessTokenExpires = '';

    this.authorizationUrl = '';
    this.hasUserAccessToken = false;
    this.userId = '';

    this.init();
  }

  async init() {
    // Get an access token
    await this.setUserInstagramAccessToken();

    // Get authorization URL
    this.setAuthorizationUrl();
  }

  async getUserAccessToken() {
    return this.userAccessToken;
  }

  async getUserAccessTokenExpires() {
    return this.userAccessTokenExpires;
  }

  setAuthorizationUrl() {
    const getVars = {
      app_id: this.appId,
      redirect_uri: this.redirectUrl,
      scope: 'user_profile,user_media',
      response_type: 'code'
    };

    // Create URL
    this.authorizationUrl = `${this.apiBaseUrl}oauth/authorize?${new URLSearchParams(getVars).toString()}`;
  }

  async setUserInstagramAccessToken() {
    if (this.getCode) { // Try to get an access token
      const userAccessTokenResponse = await this.getUserAccessToken();
      this.userAccessToken = userAccessTokenResponse.access_token;
      this.hasUserAccessToken = true;
      this.userId = userAccessTokenResponse.user_id;

      // Get long-lived access token
      const longLivedAccessTokenResponse = await this.getLongLivedUserAccessToken();
      this.userAccessToken = longLivedAccessTokenResponse.access_token;
      this.userAccessTokenExpires = longLivedAccessTokenResponse.expires_in;
    }
  }

  async getUserAccessToken() {
    try {
      const response = await axios.post(`${this.apiBaseUrl}oauth/access_token`, {
        app_id: this.appId,
        app_secret: this.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUrl,
        code: this.getCode
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user access token:', error.message);
      throw error;
    }
  }

  async getLongLivedUserAccessToken() {
    try {
      const response = await axios.get(`${this.graphBaseUrl}access_token`, {
        params: {
          client_secret: this.appSecret,
          grant_type: 'ig_exchange_token'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting long-lived user access token:', error.message);
      throw error;
    }
  }

  async getUser() {
    try {
      const response = await axios.get(`${this.graphBaseUrl}me`, {
        params: {
          fields: 'id,username,media_count,account_type',
          access_token: this.userAccessToken
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user:', error.message);
      throw error;
    }
  }

  async getUsersMedia() {
    try {
      const response = await axios.get(`${this.graphBaseUrl}${this.userId}/media`, {
        params: {
          fields: 'id,caption,media_type,media_url',
          access_token: this.userAccessToken
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user media:', error.message);
      throw error;
    }
  }

  async getPaging(pagingEndpoint) {
    try {
      const response = await axios.get(pagingEndpoint);

      return response.data;
    } catch (error) {
      console.error('Error getting paging:', error.message);
      throw error;
    }
  }

  async getMedia(mediaId) {
    try {
      const response = await axios.get(`${this.graphBaseUrl}${mediaId}`, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username',
          access_token: this.userAccessToken
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting media:', error.message);
      throw error;
    }
  }

  async getMediaChildren(mediaId) {
    try {
      const response = await axios.get(`${this.graphBaseUrl}${mediaId}/children`, {
        params: {
          fields: 'id,media_type,media_url,permalink,thumbnail_url,timestamp,username',
          access_token: this.userAccessToken
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting media children:', error.message);
      throw error;
    }
  }
}

module.exports = InstagramBasicDisplayAPI;
