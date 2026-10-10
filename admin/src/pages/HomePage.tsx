import LazySection from "@/components/LazySection";
import {
  Hero,
  MediaRow,
} from "@/components/media";

import type {
  StreamFlixController,
} from "@/features/streamflix/hooks/useStreamFlix";

type HomePageProps = {
  state: StreamFlixController;
};

export default function HomePage({
  state,
}: HomePageProps) {
  if (state.contentLoading) {
    return (
      <section
        className="
          min-h-[72vh]
          px-5
          pb-20
          pt-32
          text-slate-300
          sm:px-10
        "
      >
        <div className="mx-auto max-w-1500px">
          <p
            className="
              text-lg
              font-semibold
            "
          >
            Loading StreamFlix content...
          </p>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Fetching the latest
            catalog from the backend.
          </p>
        </div>
      </section>
    );
  }

  if (
    state.contentError ||
    !state.featuredTitle
  ) {
    return (
      <section
        className="
          min-h-[72vh]
          px-5
          pb-20
          pt-32
          text-slate-300
          sm:px-10
        "
      >
        <div
          className="
            mx-auto
            max-w-1500px
            rounded-3xl
            border
            border-rose-400/20
            bg-rose-500/5
            p-8
          "
        >
          <h1
            className="
              text-2xl
              font-bold
            "
          >
            Unable to load content
          </h1>

          <p
            className="
              mt-2
              text-slate-400
            "
          >
            {state.contentError ??
              "The backend returned no content."}
          </p>

          <p
            className="
              mt-4
              text-sm
              text-slate-500
            "
          >
            Make sure the StreamFlix
            backend is running on
            http://localhost:4000.
          </p>
        </div>
      </section>
    );
  }

  const featuredTitle =
    state.featuredTitle;

  return (
    <>
      <Hero
        content={featuredTitle}
        onPlay={() =>
          state.play(
            featuredTitle,
          )
        }
        onInfo={() =>
          state.openTitle(
            featuredTitle,
          )
        }
      />

      <div
        className="
          relative
          z-10
          -mt-10
          space-y-12
          pb-20
          sm:-mt-16
        "
      >
        {state.homeSections.map(
          (
            section,
            index,
          ) => {
            /*
             * Don't render an empty
             * Continue Watching row.
             */
            if (
              section.title ===
                "Continue Watching" &&
              section.items
                .length === 0
            ) {
              return null;
            }

            return (
              <LazySection
                key={section.title}
                minHeight={
                  index === 0
                    ? 280
                    : 340
                }
              >
                <MediaRow
                  {...section}
                  onSelect={
                    state.openTitle
                  }
                />
              </LazySection>
            );
          },
        )}
      </div>
    </>
  );
}