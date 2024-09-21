import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { SEARCH_ANIME } from '../lib/queries';

const AnimeSearch: React.FC = () => {
  const [search, setSearch] = useState('');
  const { loading, error, data } = useQuery(SEARCH_ANIME, {
    variables: { search },
    skip: !search,
  });

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search anime..."
      />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && data.Page && data.Page.media && (
        <ul>
          {data.Page.media.map((anime: any) => (
            <li key={anime.id}>{anime.title.romaji}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnimeSearch;