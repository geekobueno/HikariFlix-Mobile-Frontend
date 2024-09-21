import { gql } from '@apollo/client';

export const SEARCH_ANIME = gql`
  query SearchAnime($search: String) {
    Page(page: 1, perPage: 10) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          medium
        }
      }
    }
  }
`;

export const GET_POPULAR_ANIME = gql`
  query GetPopularAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          medium
        }
        popularity
        averageScore
      }
    }
  }
`;

export const GET_TRENDING_ANIME = gql`
  query GetTrendingAnime($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          medium
        }
        trending
        popularity
      }
    }
  }
`;

export const GET_TOP_100_ANIME_BY_AVERGAE_SCORE = gql`
  query GetTop100AnimeByVotes {
    Page(page: 1, perPage: 100) {
      media(type: ANIME, sort: SCORE_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          medium
        }
        favourites
        averageScore
      }
    }
  }
`;

export const GET_TOP_ANIME_BY_AVERAGE_SCORE = gql`
  query GetTopAnimeByAverageScore {
    Page(page: 1, perPage: 1) {
      media(type: ANIME, sort: SCORE_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
        }
        averageScore
      }
    }
  }
`;

// Add more queries as needed
