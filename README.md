# Elite Website

The best way to check a player's farming skill/weight in Hypixel skyblock.

**Website:** https://elitebot.dev/ \
**Donate:** https://elitebot.dev/donate \
**Community Discord:** https://elitebot.dev/discord \
**Development/Support Discord:** https://elitebot.dev/support

## Licensing

This project is licensed under the GPL-3.0 license. See the [LICENSE](./LICENSE) file for details.

Folders under `packages/` may have different licenses, see the respective LICENSE files in those folders for details.

## Developing

Note that this website requires the backend API to be running as well. You can find the repository for that [here](https://github.com/EliteFarmers/API). You _can_ use the actual API at https://api.elitebot.dev, but your access to that will be limited by the ratelimiting policies, and won't be suitable for work with any admin routes because you won't have the permissions needed.

1. Clone the repo, open the project, and run `pnpm i` to install dependencies

2. Create a **copy** of `.env.example`, rename it to `.env` and fill out all the fields with the relevant values. The provided default values should work fine, but you will need to change them if you're running an instance of the API.

3. Run the website in dev mode with the following:

    ```
    pnpm run dev
    ```

    Navigate to the link sent in the terminal, and it _should_ load!

## Developing with the API

If you have the [API project](https://github.com/EliteFarmers/API) running as well, you'll need to do the following to use it properly.

1. Update `ELITE_API_URL` in `.env`

    ```
    ELITE_API_URL="http://localhost:5164"
    ```

2. Optionally update `PUBLIC_DISCORD_CLIENT_ID` in `.env`. You need this to match the Discord bot/application you've registered to get the API working. Without this auth won't work properly.

    ```
    PUBLIC_DISCORD_CLIENT_ID="application-id-here"
    ```

3. After making a change to any API endpoint or DTO, you need to run `pnpm run generate-api`! This will automatically update any schemas and add/update API calls!

You should be all set to use your local instance of the API after doing those steps!

## Developing with `farming-weight`

If you have the [`farming-weight`](https://github.com/EliteFarmers/FarmingWeight) package locally for developing that, you'll need to link it to the website.

1. Run `pnpm link ../Path/To/Folder` with the correct path to the farming weight package folder. I typically have these folders side by side, and just do `pnpm link ../FarmingWeight`.

2. Run `pnpm build` every time you make a change in the npm package. This will trigger hot reloading and have your changes show up in the website.

3. Make sure not to commit the pnpm link or revert it before opening a PR! Also mention the dependency to the PR for your changes to `farming-weight`.

## Building

To create a production version of your app, follow these steps.

1. Follow steps `1-4` of the above development steps, you should then have a `.env` file to edit.

2. Edit your `.env` file for use in production. Probably use the port `3000` (or one of your choice, but be sure to change the port directive in the docker-compose-prod file as well).

    ```
    ORIGIN="http://localhost:3000"
    PUBLIC_HOST_URL="http://localhost:3000"
    ```

    Ensure that you have the port `3000` redirect uri in the Discord application settings on the developer panel mentioned above if you want to test locally.

    You might also want to set `EXTERNAL_NETWORK=true` if the API project is running in the same docker network.

3. Start up the production build with the following command:
    ```
    docker-compose up --build -d
    ```
    You can now navigate to http://localhost:3000/ to view the site.

In order to deploy this site to an actual domain name, you'd have to change the `ORIGIN` and `PUBLIC_HOST_URL` to your domain name, and follow a tutorial elsewhere and point to this address with something like nginx. (Also add your domain name to Discord OAuth urls).

If you have questions, feel free to join the [support Discord server](https://elitebot.dev/support)!
