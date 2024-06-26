import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import SynthesisEngine from "../islands/SynthesisEngine.tsx";
import { getGrid } from "../shared/db.ts";
import { Grid } from "../shared/types.ts";

export const handler: Handlers<Grid> = {
  async GET(_req, ctx) {
    const grid = await getGrid();
    return ctx.render(grid);
  },
};

export default function Home(props: PageProps<Grid>) {
  return (
    <>
      <Head>
        <title>pixelpage</title>
        <link rel="icon" type="image/jpg" href="/logo.jpg" />
      </Head>
      <SynthesisEngine grid={props.data} />
    </>
  );
}
