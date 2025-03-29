# Elite Website

The best way to check a player's farming skill/weight in Hypixel skyblock.

**Webite:** https://elitebot.dev/ \
**Donate:** https://elitebot.dev/donate \
**Community Discord:** https://elitebot.dev/discord \
**Development/Support Discord:** https://elitebot.dev/support

## Developing

Note that this website requires the backend API to be running as well. You can find the repository for that [here](https://github.com/EliteFarmers/API). You _can_ use the actual API at https://api.elitebot.dev, but your access to that will be limited by the ratelimiting policies, and won't be suitable for work with any admin routes because you won't have the permissions needed.

1. Clone the repo, open the project, and run `pnpm i` to install dependencies

2. Create a **copy** of `.env.example`, rename it to `.env` and fill out all the fields with the relevant values. The provided default values should work fine, but you will need to change them if you're running an instance of the API.

3. Make a copy of your new `.env` file and rename it to `.env.production`. You should have both. You can ignore the production enviroment file for running in dev mode, it just needs to exist.

4. Run the website in dev mode with the following:

    ```
    pnpm run dev
    ```

    Navigate to the link sent in the terminal, and it _should_ load!

## Building

To create a production version of your app, follow these steps.

1. Follow steps `1-5` of the above development steps, you should then have a `.env.production` file to edit.

2. Edit your new `.env.production` to use the port `3000` (or one of your choice, but be sure to change the port directive in the docker-compose-prod file as well).

    ```
    ORIGIN="http://localhost:3000"
    PUBLIC_HOST_URL="http://localhost:3000"
    ```

    Ensure that you have the port `3000` redirect uri in the Discord application settings on the developer panel mentioned above.

3. Start up the production build with the following command:
    ```
    docker-compose -f docker-compose-prod.yaml up --build -d
    ```
    You can now navigate to http://localhost:3000/ to view the site.

In order to deploy this site to an actual domain name, you'd have to change the `ORIGIN` and `PUBLIC_HOST_URL` to your domain name, and follow a tutorial elsewhere and point to this address with something like nginx.

If you have questions, feel free to join the [support Discord server](https://elitebot.dev/support)!
