# Elite Website

The best way to check a player's farming skill/weight in Hypixel skyblock.

https://elitebot.dev/

**Still under development**

## Developing

Note that this website requires the backend API to be running as well. You can find the repository for that [here](https://github.com/EliteFarmers/API). You _can_ use the actual API at https://api.elitebot.dev, but your access to that will be limited by the ratelimiting policies, and won't be suitable for work with any authenticated routes. (An included docker container for the API is planned for the future)

1. Download the code, open the project, and run `pnpm i` to install dependencies

2. Create a **copy** of `.env.example`, rename it to `.env` and fill out all the fields with the relevant values.

    a. `DISCORD_CLIENT_SECRET` and `PUBLIC_DISCORD_CLIENT_ID` are values found in https://discord.com/developers/applications. You'll have to create a new application, then go to the pictured location to copy these values. _DO NOT SHARE YOUR CLIENT SECRET ANYWHERE_.

    b. Other values in the `.env` file can be kept as-is for local development.

3. Back on https://discord.com/developers/applications, you'll have to add redirect URIs in the dashboard in order to have authentication work. For local developement, add the following:

    ```
    http://localhost:5173/login/callback
    http://localhost:3000/login/callback
    ```

    ![image](https://user-images.githubusercontent.com/24925519/210026662-1cea4e7d-64dc-4655-93c7-705c399d02df.png)

4. Make a copy of your new `.env` file and rename it to `.env.production`. You should have both. You can ignore the production enviroment file for running in dev mode, it just needs to exist.

5. Run the website in dev mode with the following:

    ```
    pnpm run dev
    ```

    Navigate to the link sent in the terminal, and it (should) load!

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

In order to deploy this site to an actual domain name, you'd have to change the `ORIGIN` and `PUBLIC_HOST_URL` to your domain name, and follow a tutorial elsewhere and point to this address with something like nginx forwarding.

If you have questions, feel free to join the [support Discord server](https://discord.gg/C4S7NNexps)
