import { For, Show } from "solid-js";
import { A, Title, useIsRouting, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { getRecsForWork } from "~/utils/getRecsForWork";
import { getBookData } from "~/utils/getBookData";
import "~/css/books.css";

export function routeData({ params }) {
  console.log(params.workId);
  return {
    book: createServerData$(([, workId]) => getBookData(workId), {
      key: () => ["workData", params.workId],
    }),
    recGroups: createServerData$(([, workId]) => getRecsForWork(workId), {
      key: () => ["workRecs", params.workId],
    }),
  };
}

export default function WorkPage() {
  const routeData = useRouteData();
  const isRouting = useIsRouting();

  return (
    <div class="container" classList={{ "grey-out": isRouting() }}>
      <Title>{routeData.book()?.title}</Title>
      <h1>{routeData.book()?.title}</h1>
      <p>
        By{" "}
        <a href={routeData.book()?.author.url}>
          {routeData.book()?.author.name}
        </a>
      </p>
      <p>{routeData.book()?.description}</p>
      <p>
        <img srcset={routeData.book()?.coverImgSrcSet} />
      </p>
      <Show
        when={routeData.recGroups()}
        fallback={<p>Loading recommendations...</p>}
      >
        <For each={routeData.recGroups()}>
          {(recType) => (
            <div>
              <h2>{recType.type}</h2>
              <ul class="book-list">
                <For each={recType.recs}>
                  {(rec) => (
                    <li>
                      <A prefetch="intent" href={rec.url}>
                        <img
                          src={rec.img_src}
                          width="90"
                          height="136"
                          loading="lazy"
                        />
                        <p>
                          {rec.title} by {rec.author.name}
                        </p>
                      </A>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}
