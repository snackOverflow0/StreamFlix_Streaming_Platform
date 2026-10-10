import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Check,
  Heart,
  ListPlus,
  MessageSquareText,
  Play,
  Send,
  Smartphone,
  Star,
  X,
} from "lucide-react";

import { Toaster as DeferredToaster } from "@/components/ui/sonner";

import { getEpisodeReleaseDate } from "@/features/streamflix/utils";
import {
  EPISODE_DETAILS,
  PLANS,
} from "@/features/streamflix/data";

import type {
  StreamFlixController,
} from "@/features/streamflix/hooks/useStreamFlix";

import { PlanDialog } from "./PlanDialog";
import { AccountMenu } from "./AccountMenu";
import { CartDrawer } from "./CartDrawer";

type AppModalsProps = {
  state: StreamFlixController;
};

export default function AppModals({
  state,
}: AppModalsProps) {
  const {
    detailOpen,
    setDetailOpen,
    selected,
    play,

    watchOpen,
    setWatchOpen,

    reviewOpen,
    setReviewOpen,
    reviewRating,
    setReviewRating,

    feedbackOpen,
    setFeedbackOpen,

    recordMutation,

    plansOpen,
    setPlansOpen,

    plan,
    setPlan,

    accountOpen,
    setAccountOpen,

    activeProfile,
    profiles,
    account,

    setAuthStage,

    footerPanel,
    setFooterPanel,

    cartOpen,
    setCartOpen,

    cartItems,
    cart,
    setCart,

    transactions,
    setTransactions,

    total,

    favorites,
    watchlist,

    toggleFavorite,
    toggleWatchlist,

    selectedSeason,
    setSelectedSeason,

    setNotifications,
  } = state;

  const selectedPlan = useMemo(
    () =>
      PLANS.find(
        (item) => item.id === plan,
      ),
    [plan],
  );

  return (
    <>
      <DeferredToaster
        richColors
        position="bottom-right"
      />

      {/* =========================================================
          CONTENT DETAILS
      ========================================================= */}

      <Dialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
      >
        <DialogContent
          className="
            max-h-[calc(100dvh-1rem)]
            overflow-y-auto
            border-white/10
            bg-[#0c1127]
            p-0
            text-white
            sm:max-h-[90vh]
            sm:max-w-3xl
          "
        >
          {selected && (
            <>
              {/* Hero */}
              <div
                className="
                  relative
                  h-52
                  overflow-hidden
                  rounded-t-lg
                  sm:h-64
                "
              >
                <img
                  src={
                    selected.preview ??
                    selected.poster
                  }
                  alt={selected.title}
                  width={1280}
                  height={720}
                  loading="eager"
                  decoding="async"
                  className={`
                    h-full
                    w-full
                    object-cover
                    opacity-70
                    ${
                      selected.preview
                        ? "object-center"
                        : "object-top"
                    }
                  `}
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-[#0c1127]
                    via-[#0c1127]/20
                    to-transparent
                  "
                />

                <div
                  className="
                    absolute
                    bottom-5
                    left-6
                    right-6
                  "
                >
                  <Badge
                    className="
                      mb-3
                      border-0
                      bg-violet-500
                      text-white
                    "
                  >
                    {selected.type}
                  </Badge>

                  <h2
                    className="
                      text-2xl
                      font-black
                      sm:text-3xl
                    "
                  >
                    {selected.title}
                  </h2>
                </div>
              </div>

              {/* Information */}
              <div
                className="
                  space-y-5
                  px-6
                  pb-6
                "
              >
                {/* Meta */}
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    gap-3
                    text-sm
                    text-slate-300
                  "
                >
                  <span
                    className="
                      flex
                      items-center
                      gap-1
                      text-sky-300
                    "
                  >
                    <Star className="size-4 fill-current" />
                    {selected.rating}
                  </span>

                  <span>
                    {selected.year}
                  </span>

                  <span
                    className="
                      rounded
                      border
                      border-white/25
                      px-1.5
                    "
                  >
                    {selected.maturity}
                  </span>

                  <span>
                    {selected.duration}
                  </span>

                  <span>
                    {selected.genre}
                  </span>
                </div>

                {/* Description */}
                <p
                  className="
                    leading-7
                    text-slate-300
                  "
                >
                  {selected.description}
                </p>

                {/* Cast */}
                {selected.cast &&
                  selected.cast.length > 0 && (
                    <div>
                      <p
                        className="
                          text-xs
                          uppercase
                          tracking-widest
                          text-slate-500
                        "
                      >
                        Cast
                      </p>

                      <div
                        className="
                          mt-2
                          flex
                          flex-wrap
                          gap-2
                        "
                      >
                        {selected.cast.map(
                          (actor) => (
                            <span
                              key={actor}
                              className="
                                rounded-full
                                border
                                border-white/10
                                bg-white/[0.04]
                                px-3
                                py-1
                                text-sm
                                text-slate-300
                              "
                            >
                              {actor}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {/* Buttons */}
                <div
                  className="
                    flex
                    flex-wrap
                    gap-3
                  "
                >
                  <Button
                    type="button"
                    onClick={() =>
                      play(selected)
                    }
                    className="
                      rounded-full
                      bg-gradient-to-r
                      from-blue-600
                      to-violet-600
                      px-6
                      text-white
                    "
                  >
                    <Play className="fill-current" />
                    Play now
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      toggleWatchlist(
                        selected.id,
                      )
                    }
                    className="
                      rounded-full
                      border-white/20
                      bg-white/5
                      text-white
                      hover:bg-white/10
                      hover:text-white
                    "
                  >
                    {watchlist.includes(
                      selected.id,
                    ) ? (
                      <Check />
                    ) : (
                      <ListPlus />
                    )}

                    {watchlist.includes(
                      selected.id,
                    )
                      ? "In Watchlist"
                      : "Watchlist"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      toggleFavorite(
                        selected.id,
                      )
                    }
                    className="
                      rounded-full
                      border-white/20
                      bg-white/5
                      text-white
                      hover:bg-white/10
                      hover:text-white
                    "
                  >
                    <Heart
                      className={
                        favorites.includes(
                          selected.id,
                        )
                          ? "fill-pink-500 text-pink-500"
                          : ""
                      }
                    />

                    Favorite
                  </Button>
                </div>

                {/* License / Score */}
                <div
                  className="
                    grid
                    gap-4
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    p-4
                    sm:grid-cols-2
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-widest
                        text-slate-500
                      "
                    >
                      Content license
                    </p>

                    <p className="mt-2 text-sm">
                      {selected.license}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-emerald-400
                      "
                    >
                      License active through Dec
                      2027
                    </p>
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-widest
                        text-slate-500
                      "
                    >
                      Community score
                    </p>

                    <div
                      className="
                        mt-2
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <span
                        className="
                          text-2xl
                          font-bold
                        "
                      >
                        {selected.rating}
                      </span>

                      <span
                        className="
                          text-sm
                          text-slate-400
                        "
                      >
                        from 12.4K reviews
                      </span>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    SERIES EPISODES
                ================================================= */}

                {selected.type ===
                  "Series" && (
                  <div>
                    <div
                      className="
                        mb-3
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >
                      <h3 className="font-semibold">
                        Season{" "}
                        {selectedSeason}{" "}
                        episodes
                      </h3>

                      <Select
                        value={String(
                          selectedSeason,
                        )}
                        onValueChange={(
                          value,
                        ) =>
                          setSelectedSeason(
                            Number(value),
                          )
                        }
                      >
                        <SelectTrigger
                          className="
                            w-[140px]
                            border-white/10
                            bg-white/[0.04]
                            text-white
                          "
                        >
                          <SelectValue placeholder="Choose season" />
                        </SelectTrigger>

                        <SelectContent
                          className="
                            border-white/10
                            bg-[#111733]
                            text-white
                          "
                        >
                          {Array.from(
                            {
                              length:
                                Number.parseInt(
                                  selected.duration,
                                  10,
                                ) || 1,
                            },
                            (_, index) =>
                              index + 1,
                          ).map(
                            (season) => (
                              <SelectItem
                                key={season}
                                value={String(
                                  season,
                                )}
                              >
                                Season {season}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      {EPISODE_DETAILS.map(
                        (
                          episode,
                          index,
                        ) => (
                          <button
                            type="button"
                            key={`${selectedSeason}-${episode.title}`}
                            onClick={() =>
                              play(selected)
                            }
                            className="
                              rise-hover
                              flex
                              w-full
                              items-start
                              gap-4
                              rounded-xl
                              border
                              border-white/8
                              bg-white/[0.03]
                              p-4
                              text-left
                              hover:bg-white/[0.07]
                            "
                          >
                            <span
                              className="
                                grid
                                size-10
                                shrink-0
                                place-items-center
                                rounded-lg
                                bg-violet-500/20
                                text-violet-300
                              "
                            >
                              {index + 1}
                            </span>

                            <span className="flex-1">
                              <span
                                className="
                                  block
                                  text-sm
                                  font-medium
                                "
                              >
                                {
                                  episode.title
                                }
                              </span>

                              <span
                                className="
                                  mt-1
                                  block
                                  text-xs
                                  text-slate-500
                                "
                              >
                                S
                                {
                                  selectedSeason
                                }
                                :E
                                {index + 1}
                                {" • "}
                                {48 +
                                  index *
                                    2}{" "}
                                min
                                {" • "}
                                Released{" "}
                                {getEpisodeReleaseDate(
                                  selected,
                                  selectedSeason,
                                  index,
                                )}
                              </span>

                              <span
                                className="
                                  mt-2
                                  block
                                  max-w-2xl
                                  text-xs
                                  leading-5
                                  text-slate-400
                                "
                              >
                                {
                                  episode.description
                                }
                              </span>
                            </span>

                            <Play
                              className="
                                size-4
                                shrink-0
                                self-center
                              "
                            />
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Review */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setDetailOpen(false);
                    setReviewRating(0);
                    setReviewOpen(true);
                  }}
                  className="
                    text-violet-300
                    hover:bg-violet-500/10
                    hover:text-violet-200
                  "
                >
                  <MessageSquareText />
                  Write a review
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* =========================================================
          VIDEO PLAYER
      ========================================================= */}

      <Dialog
        open={watchOpen}
        onOpenChange={setWatchOpen}
      >
        <DialogContent
          className="
            overflow-hidden
            border-white/10
            bg-black
            p-0
            text-white
            sm:max-w-4xl
          "
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            Now playing{" "}
            {selected?.title ??
              "StreamFlix content"}
          </DialogTitle>

          <DialogDescription className="sr-only">
            StreamFlix video player
          </DialogDescription>

          <div
            className="
              relative
              aspect-video
              bg-black
            "
          >
            {selected?.trailerUrl ? (
              <video
                key={selected.trailerUrl}
                src={selected.trailerUrl}
                poster={selected.poster}
                controls
                autoPlay
                playsInline
                preload="auto"
                className="
                  h-full
                  w-full
                  bg-black
                  object-contain
                "
                onPlay={() => {
                  if (!selected) {
                    return;
                  }

                  recordMutation(
                    "PlaybackStarted",
                    `${selected.title} playback started`,
                  );
                }}
                onError={(event) => {
                  console.error(
                    "StreamFlix trailer playback error:",
                    event.currentTarget.error,
                  );

                  if (!selected) {
                    return;
                  }

                  recordMutation(
                    "PlaybackError",
                    `Unable to play trailer for ${selected.title}`,
                  );
                }}
              >
                Your browser does not support
                video playback.
              </video>
            ) : (
              <div
                className="
                  relative
                  h-full
                  w-full
                "
              >
                {selected && (
                  <img
                    src={selected.poster}
                    alt={selected.title}
                    width={520}
                    height={780}
                    loading="eager"
                    decoding="async"
                    className="
                      h-full
                      w-full
                      object-cover
                      opacity-55
                    "
                  />
                )}

                <div
                  className="
                    absolute
                    inset-0
                    grid
                    place-items-center
                    px-6
                    text-center
                  "
                >
                  <div>
                    <Play
                      className="
                        mx-auto
                        size-12
                        text-slate-300
                      "
                    />

                    <p
                      className="
                        mt-3
                        text-sm
                        text-slate-300
                      "
                    >
                      Trailer not available
                      for this title.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={() =>
                setWatchOpen(false)
              }
              className="
                absolute
                right-4
                top-4
                z-20
                rounded-full
                bg-black/60
                p-2
              "
              aria-label="Close player"
            >
              <X />
            </button>

            {/* Progress */}
            <div
              className="
                pointer-events-none
                absolute
                inset-x-5
                bottom-5
                z-10
              "
            >
              <Progress
                value={
                  selected?.progress ?? 0
                }
                className="
                  h-1.5
                  bg-white/25
                  [&_[data-slot=progress-indicator]]:bg-violet-500
                "
              />

              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-between
                  text-sm
                "
              >
                <span>
                  {selected?.title}
                </span>

                <span>
                  {selected?.progress ??
                    0}
                  % watched
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          REVIEW
      ========================================================= */}

      <Dialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      >
        <DialogContent
          className="
            border-white/10
            bg-[#0c1127]
            text-white
          "
        >
          <DialogHeader>
            <DialogTitle>
              Review{" "}
              {selected?.title ??
                "this title"}
            </DialogTitle>

            <DialogDescription className="text-slate-400">
              Share your rating and thoughts.
            </DialogDescription>
          </DialogHeader>

          <div
            className="flex gap-1"
            aria-label="Rating"
          >
            {[1, 2, 3, 4, 5].map(
              (star) => (
                <button
                  type="button"
                  key={star}
                  aria-label={`${star} star${
                    star === 1
                      ? ""
                      : "s"
                  }`}
                  aria-pressed={
                    reviewRating === star
                  }
                  onClick={() =>
                    setReviewRating(
                      star,
                    )
                  }
                  className={`
                    rounded-md
                    p-1
                    transition
                    hover:scale-110
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-sky-300
                    ${
                      star <=
                      reviewRating
                        ? "text-sky-300"
                        : "text-slate-600 hover:text-sky-200"
                    }
                  `}
                >
                  <Star
                    className={`
                      size-8
                      ${
                        star <=
                        reviewRating
                          ? "fill-current"
                          : "fill-transparent"
                      }
                    `}
                  />
                </button>
              ),
            )}
          </div>

          <p
            className="
              text-sm
              text-slate-400
            "
            aria-live="polite"
          >
            {reviewRating
              ? `${reviewRating} out of 5 stars selected`
              : "Select a rating from 1 to 5 stars"}
          </p>

          <Textarea
            className="
              min-h-28
              border-white/10
              bg-white/5
            "
            placeholder="What did you think?"
          />

          <DialogFooter>
            <Button
              type="button"
              disabled={
                reviewRating === 0
              }
              onClick={() => {
                setReviewOpen(false);

                recordMutation(
                  "CreateReview",
                  `Your ${reviewRating}-star review was published`,
                );
              }}
              className="
                bg-violet-600
                text-white
              "
            >
              <Send />
              Publish review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          FEEDBACK
      ========================================================= */}

      <Dialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
      >
        <DialogContent
          className="
            border-white/10
            bg-[#0c1127]
            text-white
          "
        >
          <DialogHeader>
            <DialogTitle>
              Send feedback
            </DialogTitle>

            <DialogDescription className="text-slate-400">
              Report an issue, suggest a
              title, or tell us what would
              improve StreamFlix.
            </DialogDescription>
          </DialogHeader>

          <Input
            className="
              border-white/10
              bg-white/5
            "
            placeholder="Subject"
          />

          <Textarea
            className="
              min-h-32
              border-white/10
              bg-white/5
            "
            placeholder="Your message"
          />

          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setFeedbackOpen(false);

                recordMutation(
                  "SubmitFeedback",
                  "Feedback sent to the StreamFlix team",
                );
              }}
              className="
                bg-violet-600
                text-white
              "
            >
              <Send />
              Send feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          SUBSCRIPTION PLANS
      ========================================================= */}

      <PlanDialog
        open={plansOpen}
        onOpenChange={setPlansOpen}
        current={plan}
        onSelect={(id) => {
          setPlan(id);
          setPlansOpen(false);

          recordMutation(
            "ChangeSubscription",
            `Subscription changed to ${
              PLANS.find(
                (item) =>
                  item.id === id,
              )?.name ?? id
            }`,
          );
        }}
      />

      {/* =========================================================
          ACCOUNT MENU
      ========================================================= */}

      <AccountMenu
        open={accountOpen}
        onOpenChange={setAccountOpen}
        profile={activeProfile}
        profiles={profiles}
        account={account}
        plan={
          selectedPlan?.name ??
          plan
        }
        onPlans={() => {
          setAccountOpen(false);
          setPlansOpen(true);
        }}
        onFeedback={() => {
          setAccountOpen(false);
          setFeedbackOpen(true);
        }}
        onSwitchProfiles={() => {
          setAccountOpen(false);
          setAuthStage("profiles");
        }}
        onSignOut={() => {
          state.logout();
        }}
      />

      {/* =========================================================
          FOOTER PANELS
      ========================================================= */}

      <Dialog
        open={footerPanel !== null}
        onOpenChange={(open) => {
          if (!open) {
            setFooterPanel(null);
          }
        }}
      >
        <DialogContent
          className="
            border-white/10
            bg-[#0a0f23]
            text-white
            sm:max-w-lg
          "
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              {footerPanel ===
              "devices"
                ? "Your devices"
                : footerPanel === "help"
                  ? "Help center"
                  : footerPanel ===
                      "accessibility"
                    ? "Accessibility"
                    : "Legal"}
            </DialogTitle>

            <DialogDescription className="text-slate-400">
              {footerPanel ===
              "devices"
                ? "Devices currently associated with your member profiles."
                : footerPanel === "help"
                  ? "Quick answers and support for your StreamFlix account."
                  : footerPanel ===
                      "accessibility"
                    ? "StreamFlix is designed for comfortable viewing and navigation."
                    : "Important information about using StreamFlix."}
            </DialogDescription>
          </DialogHeader>

          {footerPanel ===
          "devices" ? (
            <div className="space-y-2">
              {profiles.map(
                (memberProfile) => (
                  <div
                    key={
                      memberProfile.id
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.03]
                      p-3
                    "
                  >
                    <Smartphone
                      className="
                        size-5
                        text-violet-300
                      "
                    />

                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {
                          memberProfile.deviceName
                        }
                      </p>

                      <p
                        className="
                          text-xs
                          text-slate-500
                        "
                      >
                        {
                          memberProfile.name
                        }{" "}
                        •{" "}
                        {
                          memberProfile.deviceType
                        }
                      </p>
                    </div>

                    <Badge
                      className="
                        bg-emerald-500/10
                        text-emerald-300
                      "
                    >
                      Active
                    </Badge>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div
              className="
                space-y-3
                rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                p-4
                text-sm
                leading-6
                text-slate-300
              "
            >
              {footerPanel ===
                "help" && (
                <>
                  <p>
                    <strong className="text-white">
                      Playback:
                    </strong>{" "}
                    Select any title, then
                    choose Play now.
                  </p>

                  <p>
                    <strong className="text-white">
                      My List:
                    </strong>{" "}
                    Use Watchlist or Favorite
                    on a title to save it.
                  </p>

                  <p>
                    <strong className="text-white">
                      Account:
                    </strong>{" "}
                    Manage profiles, devices,
                    and your plan from the
                    profile menu.
                  </p>
                </>
              )}

              {footerPanel ===
                "accessibility" && (
                <>
                  <p>
                    Keyboard navigation,
                    visible focus states,
                    descriptive image labels,
                    and reduced-motion
                    preferences are supported.
                  </p>

                  <p>
                    Use your browser zoom
                    and device display settings
                    to adjust text size and
                    contrast.
                  </p>
                </>
              )}

              {footerPanel ===
                "legal" && (
                <>
                  <p>
                    <strong className="text-white">
                      Terms of use:
                    </strong>{" "}
                    StreamFlix content is
                    provided for personal
                    viewing within your
                    selected plan.
                  </p>

                  <p>
                    <strong className="text-white">
                      Privacy:
                    </strong>{" "}
                    Demo account preferences
                    are stored on this device
                    to maintain your
                    experience.
                  </p>

                  <p>
                    <strong className="text-white">
                      Content rights:
                    </strong>{" "}
                    Titles and artwork remain
                    the property of their
                    respective owners.
                  </p>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {footerPanel ===
              "help" && (
              <Button
                type="button"
                onClick={() => {
                  setFooterPanel(null);
                  setFeedbackOpen(true);
                }}
                className="
                  bg-violet-600
                  text-white
                  hover:bg-violet-500
                "
              >
                <MessageSquareText />
                Send feedback
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFooterPanel(null)
              }
              className="
                border-white/15
                bg-white/5
                text-white
                hover:bg-white/10
                hover:text-white
              "
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================
          CART
      ========================================================= */}

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        quantities={cart}
        total={total}
        transactions={transactions}
        updateQuantity={(
          id,
          quantity,
        ) =>
          setCart((items) => {
            if (quantity <= 0) {
              const next = {
                ...items,
              };

              delete next[id];

              return next;
            }

            return {
              ...items,
              [id]: quantity,
            };
          })
        }
        remove={(id) =>
          setCart((items) => {
            const next = {
              ...items,
            };

            delete next[id];

            return next;
          })
        }
        checkout={(
          paymentMethod,
          deliveryMethod,
        ) => {
          const transaction = {
            id: `SF-${Date.now()
              .toString()
              .slice(-8)}`,

            items: cartItems.map(
              ({
                id,
                name,
                price,
              }) => ({
                id,
                name,
                price,
                quantity:
                  cart[id] ?? 1,
              }),
            ),

            total,

            createdAt:
              new Date().toLocaleString(
                "en-PH",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                },
              ),

            paymentMethod,
            deliveryMethod,

            status:
              "Completed" as const,
          };

          setTransactions(
            (current) => [
              transaction,
              ...current,
            ],
          );

          const itemCount =
            transaction.items.reduce(
              (
                sum,
                item,
              ) =>
                sum +
                item.quantity,
              0,
            );

          setNotifications(
            (current) => [
              {
                id: `order-${transaction.id}`,

                title:
                  "Order confirmed",

                message:
                  `${itemCount} item${
                    itemCount ===
                    1
                      ? ""
                      : "s"
                  } ordered for ₱${transaction.total.toLocaleString()}.`,

                time:
                  "Just now",

                unread: true,
              },

              ...current,
            ],
          );

          setCart({});

          recordMutation(
            "CreateMerchandiseTransaction",
            `Transaction ${transaction.id} completed`,
          );
        }}
      />
    </>
  );
}