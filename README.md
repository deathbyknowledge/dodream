# DODream

Minimal example of how to get [Moondream](https://moondream.ai/) up and running with Durable Objects. Supports both cloud and local Moondream!
I used RedwoodSDK but you can use any framework you like.

# Running Moondream
You can use Moondream by either running it yourself locally (just ~1GB! in size) or by using their cloud provider.

## Running locally
Follow the instructions [here](https://moondream.ai/station). It's just running:
```sh
curl https://depot.moondream.ai/station/install.sh | bash
```

It installs Moondream Station, which is an inference server that also exposes a CLI client for ease of use. (We only need inference server).

Once you have it running, you can run `admin get-config` and it will print the inference URL. Check their docs for more information.

To use your local server, update the `INFERENCE_URL` var in `wrangler.jsonc`.

## Running on their cloud provider
Create an api key from [here](https://moondream.ai/c/cloud/api-keys) and add it to `.dev.vars`. If you deploy your worker, make sure you also create the secret with
```sh
npx wrangler secret put MOONDREAM_API_KEY
```

# Running the dev server

```shell
npm i # if it's the first time running
npm run dev
```
(npm or whatever you use)

Open `http://localhost:5173/`.

# Examples
The UI this exposes basically copies what the [Moondream Playground](https://moondream.ai/c/playground).

## Captioning
![Captioning](/imgs/caption-example.png)

## Query
![Query](/imgs/query-example.png)

## Point
![Point](/imgs/point-example.png)

## Detect
![Detect](/imgs/detect-example.png)