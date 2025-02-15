Hello! This app uses the Spotify Developer API to retrieve new releases from ALL of your followed artists and allows you to easily add them to a desired playlist for future listening.

To run the app:
  - Create a .env file with the following values:
    - SPOTIFY_CLIENT_ID
    - SPOTIFY_CLIENT_SECRET
    - SPOTIFY_PLAYLIST_ID
      - This can be found by going to open.spotify.com, selecting the desired playlist, and copying the last part of the URL path
  - Run 'npm install' to retrieve and configure the required node packages
  - Run 'npm start'

The app will open a new browser window or tab. If not authenticated, the user is prompted to log in using Spotify credentials (this is a one-time step unless cookies are cleared). Once authenticated, a simple form will be shown with filter options. Once submitted, the app will cycle through images of the user's followed artists as new releases are retrieved. Depending on the number of followed artists, this process should take no longer than a few minutes.

Once complete, a list of albums will be shown with information about each and the list of associated tracks to their right. To add them to the defined playlist, either:
  - Click on the album art to add all tracks on that album
  - Click on individual track titles to add them one at a time
When tracks are successfully added, they will be highlighted in green font with a checkmark next to their title. The click-to-add function will become disabled to prevent duplicate adding.

Happy listening!
