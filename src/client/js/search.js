const myRequest = new Request(
    'https://api.spotify.com/v1/search',
    {method: 'GET', body: '{"foo":"bar"}'}
)