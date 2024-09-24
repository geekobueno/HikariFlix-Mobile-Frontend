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
      media(sort: POPULARITY_DESC, type: ANIME) {
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

export const GET_TOP_ANIME_BY_AVERAGE_SCORE = gql`
  query GetTopAnimeByAverageScore($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(sort: SCORE_DESC, type: ANIME) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
          medium
        }
        bannerImage
        averageScore
      }
    }
  }
`;

export const GET_ANIME_GENRES = gql`
  query GetAnimeGenres {
    GenreCollection
  }
`;

export const GET_ANIME_BY_GENRE = gql`
  query GetAnimeByGenre($genre: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(genre: $genre, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          medium
        }
        averageScore
      }
    }
  }
`;

export const GET_ANIME_DETAILS = gql`
  query GetAnimeDetails($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
      }
      bannerImage
      description
      genres
      averageScore
      popularity
      episodes
      season
      seasonYear
      status
      studios {
        nodes {
          name
        }
      }
    }
  }
`;

// Add more queries as needed
