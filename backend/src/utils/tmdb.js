// TMDB API integration [citation:2]
const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

class TMDB {
  constructor() {
    this.apiKey = TMDB_API_KEY;
  }

  async getPopular(page = 1) {
    const response = await axios.get(`${BASE_URL}/movie/popular`, {
      params: {
        api_key: this.apiKey,
        page
      }
    });
    return response.data.results;
  }

  async getNowPlaying(page = 1) {
    const response = await axios.get(`${BASE_URL}/movie/now_playing`, {
      params: {
        api_key: this.apiKey,
        page
      }
    });
    return response.data.results;
  }

  async getUpcoming(page = 1) {
    const response = await axios.get(`${BASE_URL}/movie/upcoming`, {
      params: {
        api_key: this.apiKey,
        page
      }
    });
    return response.data.results;
  }

  async getMovieDetails(movieId) {
    const response = await axios.get(`${BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: this.apiKey,
        append_to_response: 'videos,credits'
      }
    });
    return response.data;
  }

  async searchMovies(query) {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: this.apiKey,
        query
      }
    });
    return response.data.results;
  }
}

module.exports = new TMDB();
