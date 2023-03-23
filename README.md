# Elite Website

The best way to check a player's farming skill/weight in Hypixel skyblock.

https://elitebot.dev/

**Still under development**

## Developing

1. Download the code, open the project, and run `npm i` to install dependencies

2. Create a **copy** of `.env.example`, rename it to `.env` and fill out all the fields with the relevant values.

    a. For developing using the included `cache` redis container, use the following values that are already provided:

    ```env
    POSTGRES_URI="postgres://user:postgres123@localhost:5434/elite"
    REDIS_URI="redis://localhost:6379"
    REDIS_PASSWORD="redisCachePassword123"
    ```

    If you have redis running elsewhere, you may use that.

    b. `DISCORD_CLIENT_SECRET` and `PUBLIC_DISCORD_CLIENT_ID` are values found in https://discord.com/developers/applications. You'll have to create a new application, then go to the pictured location to copy these values. _DO NOT SHARE YOUR CLIENT SECRET ANYWHERE_.

    c. Other values in the `.env` file can be kept as-is for local development.

3. Create a **copy** of `src/database/database.example.json`, and rename it to `database.json`, keep the new file in this folder. This file is used to store the database connection information, and is not tracked by git. You'll have to fill out the values to properly connect to a postgres instance, or keep them as-is for the included container. Note that you _should_ specify different databases for development and production.

4. Back on https://discord.com/developers/applications, you'll have to add redirect URIs in the dashboard in order to have authentication work. For local developement, add the following:

    ```
    http://localhost:5173/login/callback
    http://localhost:3000/login/callback
    ```

    ![image](https://user-images.githubusercontent.com/24925519/210026662-1cea4e7d-64dc-4655-93c7-705c399d02df.png)

5. Make a copy of your new `.env` file and rename it to `.env.production`. You should have both. You can ignore the production enviroment file for running in dev mode, it just needs to exist.

6. Start up the database and redis containers (or other postgres database if you went that route). You'll need to have `docker-compose` (comes with [Docker Desktop](https://www.docker.com/products/docker-desktop/)) installed on your system.

    ```
    docker-compose up database cache --build -d
    ```

    This command will only start up the database, and not the production container. For ease of use, the docker compose up and down functions are aliased to `npm run up` and `npm run down`.

7. Run the website in dev mode with the following:

    **Note:** Run `npm run prepare` before running the dev command for the first time, or if you make changes to the SMUI themes/components.

    ```
    npm run dev
    ```

    Navigate to the link sent in the terminal, and it (should) load!

## Building

To create a production version of your app, follow these steps.

1. Follow steps `1-5` of the above development steps, you should then have a `.env.production` file to edit.

2. To use the included database and cache, edit the host names in `.env.production` as shown. Replace `secure-password-here` with secure passwords of choice.

    ```
    POSTGRES_URI="postgres://postgres:secure-password-here@localhost/postgres"
    REDIS_URI="redis://localhost:6379"
    REDIS_PASSWORD="secure-password-here"
    ```

    You should then edit `docker-compose-prod.yaml` to use both of these new passwords in their repective areas. This production docker-compose file removes the port directives to the database and cache, restricting connections to only within the docker network for a layer of protection. This might not be the behavior that you want.

3. Edit your new `.env.production` to use the port `3000` (or one of your choice, but be sure to change the port directive in the docker-compose-prod file as well).

    ```
    ORIGIN="http://localhost:3000"
    PUBLIC_HOST_URL="http://localhost:3000"
    ```

    Ensure that you have the port `3000` redirect uri in the Discord application settings on the developer panel mentioned above.

4. Start up the production build with the following command:
    ```
    docker-compose -f docker-compose-prod.yaml up --build -d
    ```
    You can now navigate to http://localhost:3000/ to view the site.

In order to deploy this site to an actual domain name, you'd have to change the `ORIGIN` and `PUBLIC_HOST_URL` to your domain name, and follow a tutorial elsewhere and point to this address with something like nginx forwarding.

If you have questions, feel free to join the [support Discord server](https://discord.gg/HXxJZwN2Mu)
