'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  Video,
  MessageCircle,
  Sparkles,
  Camera,
  SlidersHorizontal,
  Award,
  Star,
  MapPin,
  PiggyBank,
  Cog,
  ShieldCheck,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Spinner } from '@/components/ui/spinner';
import { FilterMultiSelect } from '@/components/filter-multi-select';
import { FilterPriceSelect } from '@/components/filter-price-select';
import { LocationMultiSelect } from '@/components/location-multi-select';
import { SeeLiveDialog } from '@/components/see-live-dialog';
import { ContactDialog } from '@/components/contact-dialog';
import { MoreFiltersDialog, type MoreFiltersApplyPayload } from '@/components/more-filters-dialog';
import { AiSearchDialog, type AiSearchApplyPayload } from '@/components/ai-search-dialog';
import { AiChatDialog } from '@/components/ai-chat-dialog';
import { LandingDealCard } from '@/components/landing-deal-card';
import { useViewProWidget } from '@/components/view-pro-widget-provider';
import { api } from '@/lib/api';
import {
  mapInventoryItem,
  type InventoryListResponse,
  type InventoryPagination,
  type InventoryUnit,
} from '@/lib/types';
import { cn, getMakeOptions, maxPriceOptions } from '@/lib/utils';

async function fetchDealsInventories(): Promise<{ inventories: InventoryUnit[]; pagination: InventoryPagination }> {
  const res = (await api.get('inventory', {
    params: {
      currentPage: 1,
      type: 'deals',
      body: 'class-b',
    },
  })) as InventoryListResponse;

  const { inventories, pagination } = res.data;
  return {
    inventories: inventories.map(mapInventoryItem),
    pagination,
  };
}

type HomeSearchTab = 'inventory' | 'ai' | 'live';

export default function HomePage() {
  const router = useRouter();
  const { isAvailable, users, open } = useViewProWidget();
  const [searchTab, setSearchTab] = useState<HomeSearchTab>('inventory');
  const [filterMakes, setFilterMakes] = useState<string[]>([]);
  const [filterRvTypes, setFilterRvTypes] = useState<string[]>([]);
  const [filterSleeps, setFilterSleeps] = useState<string | null>(null);
  const [filterDriveTrains, setFilterDriveTrains] = useState<string[]>([]);
  const [filterFuels, setFilterFuels] = useState<string[]>([]);
  const [filterFeatures, setFilterFeatures] = useState<string[]>([]);
  const [filterMinYear, setFilterMinYear] = useState<string | null>(null);
  const [filterMaxYear, setFilterMaxYear] = useState<string | null>(null);
  const [filterMinPrice, setFilterMinPrice] = useState<number | null>(null);
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | null>(null);
  const [filterMinMileage, setFilterMinMileage] = useState<number | null>(null);
  const [filterMaxMileage, setFilterMaxMileage] = useState<number | null>(null);
  const [filterLocations, setFilterLocations] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [seeLiveDialogOpen, setSeeLiveDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [aiSearchDialogOpen, setAiSearchDialogOpen] = useState(false);
  const [aiChatDialogOpen, setAiChatDialogOpen] = useState(false);

  const submitSearch = useCallback(() => {
    const sp = new URLSearchParams();
    if (filterMakes.length > 0) sp.set('make', filterMakes.join(','));
    if (filterRvTypes.length > 0) sp.set('rvType', filterRvTypes.join(','));
    if (filterSleeps) sp.set('sleeps', filterSleeps);
    if (filterDriveTrains.length > 0) sp.set('driveTrain', filterDriveTrains.join(','));
    if (filterFuels.length > 0) sp.set('fuel', filterFuels.join(','));
    if (filterFeatures.length > 0) sp.set('feature', filterFeatures.join(','));
    if (filterMinYear) sp.set('minYear', filterMinYear);
    if (filterMaxYear) sp.set('maxYear', filterMaxYear);
    if (filterMinPrice) sp.set('minPrice', filterMinPrice.toString());
    if (filterMaxPrice) sp.set('maxPrice', filterMaxPrice.toString());
    if (filterMinMileage) sp.set('minMileage', filterMinMileage.toString());
    if (filterMaxMileage) sp.set('maxMileage', filterMaxMileage.toString());
    if (filterLocations.length > 0) sp.set('location', filterLocations.join(','));
    const qs = sp.toString();
    router.push(qs ? `/inventory?${qs}` : '/inventory');
  }, [
    router,
    filterMakes,
    filterRvTypes,
    filterSleeps,
    filterDriveTrains,
    filterFuels,
    filterFeatures,
    filterMinYear,
    filterMaxYear,
    filterMinPrice,
    filterMaxPrice,
    filterMinMileage,
    filterMaxMileage,
    filterLocations,
  ]);

  const applyMoreFilters = useCallback(
    (payload: MoreFiltersApplyPayload) => {
      const sp = new URLSearchParams();
      if (payload.makes && payload.makes.length > 0) {
        setFilterMakes(payload.makes);
        sp.set('make', payload.makes.join(','));
      }
      if (payload.rvTypes && payload.rvTypes.length > 0) {
        setFilterRvTypes(payload.rvTypes);
        sp.set('rvType', payload.rvTypes.join(','));
      }
      if (payload.sleeps) {
        setFilterSleeps(payload.sleeps);
        sp.set('sleeps', payload.sleeps);
      }
      if (payload.driveTrains && payload.driveTrains.length > 0) {
        setFilterDriveTrains(payload.driveTrains);
        sp.set('driveTrain', payload.driveTrains.join(','));
      }
      if (payload.fuels && payload.fuels.length > 0) {
        setFilterFuels(payload.fuels);
        sp.set('fuel', payload.fuels.join(','));
      }
      if (payload.features && payload.features.length > 0) {
        setFilterFeatures(payload.features);
        sp.set('feature', payload.features.join(','));
      }
      if (payload.minYear) {
        setFilterMinYear(payload.minYear);
        sp.set('minYear', payload.minYear);
      }
      if (payload.maxYear) {
        setFilterMaxYear(payload.maxYear);
        sp.set('maxYear', payload.maxYear);
      }
      if (payload.minPrice) {
        setFilterMinPrice(payload.minPrice);
        sp.set('minPrice', payload.minPrice.toString());
      }
      if (payload.maxPrice) {
        setFilterMaxPrice(payload.maxPrice);
        sp.set('maxPrice', payload.maxPrice.toString());
      }
      if (payload.minMileage) {
        setFilterMinMileage(payload.minMileage);
        sp.set('minMileage', payload.minMileage.toString());
      }
      if (payload.maxMileage) {
        setFilterMaxMileage(payload.maxMileage);
        sp.set('maxMileage', payload.maxMileage.toString());
      }
      if (payload.locations && payload.locations.length > 0) {
        setFilterLocations(payload.locations);
        sp.set('location', payload.locations.join(','));
      }
      const qs = sp.toString();
      router.push(qs ? `/inventory?${qs}` : '/inventory');
    },
    [router],
  );

  const applyAiSearch = useCallback(
    (payload: AiSearchApplyPayload) => {
      const sp = new URLSearchParams();
      if (payload.q) {
        setKeyword(payload.q.trim());
        sp.set('q', payload.q.trim());
      }
      if (payload.minPrice) {
        setFilterMinPrice(payload.minPrice);
        sp.set('minPrice', payload.minPrice.toString());
      }
      if (payload.sleeps) {
        setFilterSleeps(payload.sleeps);
        sp.set('sleeps', payload.sleeps);
      }
      if (payload.driveTrains && payload.driveTrains.length > 0) {
        setFilterDriveTrains(payload.driveTrains);
        sp.set('driveTrain', payload.driveTrains.join(','));
      }
      if (payload.features && payload.features.length > 0) {
        setFilterFeatures(payload.features);
        sp.set('feature', payload.features.join(','));
      }
      if (payload.inStockOnly) {
        sp.set('inStockOnly', payload.inStockOnly.toString());
      }
      const qs = sp.toString();
      router.push(qs ? `/inventory?${qs}` : '/inventory');
    },
    [router],
  );

  useEffect(() => {
    if (!isAvailable && searchTab === 'live') {
      setSearchTab('inventory');
    }
  }, [isAvailable, searchTab]);

  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);
    fetchDealsInventories()
      .then((res) => {
        if (ignore) return;
        setUnits(res.inventories);
      })
      .catch((err: Error) => {
        if (ignore) return;
        setError(err.message || 'Failed to load inventory');
        setUnits([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="bg-neutral-50 pb-10 sm:pb-16">
      <section className="relative flex min-h-[calc(100vh-116px)] w-full flex-col overflow-hidden select-none md:min-h-[calc(100vh-80px)]">
        <div className="absolute inset-0">
          <Image
            src="/images/landing_hero.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-r from-white/50 via-white/25 to-transparent"
            aria-hidden
          />
          <div
            className="to-white/00 pointer-events-none absolute inset-0 bg-linear-to-t from-white/25 via-transparent to-transparent sm:from-white/15"
            aria-hidden
          />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 md:px-8 md:pt-12">
          <div className="flex max-w-2xl flex-1 shrink-0 flex-col justify-center">
            <div className="text-3xl font-bold tracking-wide text-neutral-900 uppercase sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="block">The right van.</span>
              <span className="block">The right price.</span>
            </div>
            <div className="text-primary mt-4 text-lg font-bold tracking-wide uppercase sm:text-xl md:text-2xl lg:text-3xl">
              Ready when you are.
            </div>
            <div className="mt-6 max-w-md text-sm leading-relaxed font-medium text-neutral-800 sm:text-base md:text-lg">
              <span className="flex items-center gap-2">
                <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-green-500">
                  <Check className="size-2.5 shrink-0 text-white" strokeWidth={5} aria-hidden />
                </div>
                Handpicked Class B vans.
              </span>
              <span className="flex items-center gap-2">
                <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-green-500">
                  <Check className="size-2.5 shrink-0 text-white" strokeWidth={5} aria-hidden />
                </div>
                Real inventory. Real people.
              </span>
              <span className="flex items-center gap-2">
                <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-green-500">
                  <Check className="size-2.5 shrink-0 text-white" strokeWidth={5} aria-hidden />
                </div>
                See it live. Drive it home.
              </span>
            </div>
            <div className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              {isAvailable && (
                <button
                  type="button"
                  onClick={() => setSeeLiveDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex h-auto min-h-12 w-full cursor-pointer flex-row items-center justify-center gap-2 rounded border-0 px-6 py-1.5 text-xs font-bold uppercase shadow-none sm:w-auto sm:px-8 sm:py-3 sm:text-sm"
                >
                  <Video className="size-8 shrink-0" strokeWidth={2} aria-hidden />
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-base font-extrabold text-white uppercase">See vans live</span>
                    <span className="text-xs tracking-wide text-white uppercase">Instant live walk-through</span>
                  </div>
                </button>
              )}
              {isAvailable && (
                <button
                  type="button"
                  onClick={() => setContactDialogOpen(true)}
                  className="flex h-auto min-h-12 w-full cursor-pointer flex-row items-center justify-center gap-2 rounded border border-white bg-neutral-900 px-6 py-1.5 text-xs font-bold text-white uppercase shadow-none hover:bg-neutral-800 sm:w-auto sm:px-8 sm:py-3 sm:text-sm"
                >
                  <MessageCircle className="size-8 shrink-0" strokeWidth={2} aria-hidden />
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-base font-extrabold text-white uppercase">Text a specialist</span>
                    <span className="text-xs tracking-wide text-white uppercase">We reply fast</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div id="home-search" className="relative z-20 mt-8 w-full shrink-0 scroll-mt-24 sm:mt-10 md:mt-12">
            <div className="overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-[0_22px_50px_-12px_rgba(0,0,0,0.18)] sm:rounded-[1.25rem]">
              <div
                role="tablist"
                aria-label="Search options"
                className={cn(
                  'grid min-w-0 overflow-x-hidden border-b border-neutral-200',
                  isAvailable ? 'grid-cols-3' : 'grid-cols-2',
                )}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={searchTab === 'inventory'}
                  title="Search inventory"
                  onClick={() => setSearchTab('inventory')}
                  className={cn(
                    'relative flex min-h-12 min-w-0 flex-col items-stretch justify-center p-0 text-center transition-colors',
                    'text-xs font-extrabold tracking-wide uppercase sm:text-sm',
                    searchTab === 'inventory' ? 'text-neutral-900' : 'text-neutral-500',
                    searchTab === 'inventory' &&
                      'after:bg-primary after:absolute after:right-2 after:bottom-0 after:left-2 after:h-0.5 after:rounded-full',
                  )}
                >
                  <span className="@container flex min-h-0 w-full min-w-0 flex-1 flex-col justify-center px-1 py-4 sm:px-2">
                    <span className="flex min-w-0 flex-col items-center justify-center gap-1 @min-[13rem]:flex-row @min-[13rem]:flex-nowrap @min-[13rem]:gap-2">
                      <Search
                        className={cn(
                          'size-4 shrink-0 sm:size-5',
                          searchTab === 'inventory' ? 'text-neutral-900' : 'text-neutral-400',
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span className="max-w-full min-w-0 text-center text-balance wrap-break-word @min-[13rem]:whitespace-nowrap">
                        Search inventory
                      </span>
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={searchTab === 'ai'}
                  title="AI assisted search"
                  onClick={() => setSearchTab('ai')}
                  className={cn(
                    'relative flex min-h-12 min-w-0 flex-col items-stretch justify-center p-0 text-center transition-colors',
                    'text-xs font-extrabold tracking-wide uppercase sm:text-sm',
                    searchTab === 'ai' ? 'text-neutral-900' : 'text-neutral-500',
                    searchTab === 'ai' &&
                      'after:bg-primary after:absolute after:right-2 after:bottom-0 after:left-2 after:h-0.5 after:rounded-full',
                  )}
                >
                  <span className="@container flex min-h-0 w-full min-w-0 flex-1 flex-col justify-center px-1 py-4 sm:px-2">
                    <span className="flex min-w-0 flex-col items-center justify-center gap-1 @min-[13rem]:flex-row @min-[13rem]:flex-nowrap @min-[13rem]:gap-2">
                      <Sparkles
                        className={cn(
                          'size-4 shrink-0 sm:size-5',
                          searchTab === 'ai' ? 'text-primary' : 'text-primary/60',
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span className="flex max-w-full min-w-0 flex-col items-center gap-0.5 @min-[13rem]:flex-row @min-[13rem]:flex-nowrap @min-[13rem]:items-center @min-[13rem]:gap-1.5">
                        <span className="min-w-0 text-center text-balance wrap-break-word @min-[13rem]:text-left @min-[13rem]:whitespace-nowrap">
                          AI assisted search
                        </span>
                        <Badge className="shrink-0 border-sky-200/90 bg-sky-100 px-1 py-0 text-[8px] font-extrabold tracking-wide text-sky-900 uppercase sm:px-1.5 sm:text-[10px]">
                          New
                        </Badge>
                      </span>
                    </span>
                  </span>
                </button>
                {isAvailable ? (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={searchTab === 'live'}
                    title="See vans live"
                    onClick={() => setSearchTab('live')}
                    className={cn(
                      'relative flex min-h-12 min-w-0 flex-col items-stretch justify-center p-0 text-center transition-colors',
                      'text-xs font-extrabold tracking-wide uppercase sm:text-sm',
                      searchTab === 'live' ? 'text-neutral-900' : 'text-neutral-500',
                      searchTab === 'live' &&
                        'after:bg-primary after:absolute after:right-2 after:bottom-0 after:left-2 after:h-0.5 after:rounded-full',
                    )}
                  >
                    <span className="@container flex min-h-0 w-full min-w-0 flex-1 flex-col justify-center px-1 py-4 sm:px-2">
                      <span className="flex min-w-0 flex-col items-center justify-center gap-1 @min-[13rem]:flex-row @min-[13rem]:flex-nowrap @min-[13rem]:gap-2">
                        <Camera
                          className={cn(
                            'size-4 shrink-0 sm:size-5',
                            searchTab === 'live' ? 'text-neutral-900' : 'text-neutral-400',
                          )}
                          strokeWidth={2}
                          aria-hidden
                        />
                        <span className="max-w-full min-w-0 text-center text-balance wrap-break-word @min-[13rem]:whitespace-nowrap">
                          See vans live
                        </span>
                        <span
                          className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
                          title="Live"
                          aria-hidden
                        />
                      </span>
                    </span>
                  </button>
                ) : null}
              </div>

              {searchTab === 'inventory' ? (
                <div className="flex flex-col gap-3 p-4 lg:gap-4">
                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
                    <div className="flex min-h-[52px] w-full flex-col justify-center gap-0.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 transition hover:border-neutral-300 hover:bg-neutral-50/80">
                      <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">Make</span>
                      <FilterMultiSelect
                        options={getMakeOptions({ body: 'class-b' })}
                        selected={filterMakes}
                        onChange={setFilterMakes}
                        allLabel="Any make"
                        countNoun="makes"
                        aria-label="Filter by make"
                        triggerClassName="min-h-0 w-full justify-between rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-base [&>span]:font-bold [&>span]:text-neutral-900 [&_svg]:text-primary"
                        contentClassName="min-w-[min(100%,var(--radix-popover-trigger-width))] sm:min-w-[240px]"
                      />
                    </div>

                    <LocationMultiSelect
                      selected={filterLocations}
                      onChange={setFilterLocations}
                      emptySummaryLabel="Nationwide"
                      fieldLabel="Location"
                      triggerClassName="min-h-[52px] rounded-lg border border-neutral-200 bg-white px-3 py-2 transition hover:border-neutral-300 hover:bg-neutral-50/80 focus-visible:ring-2 focus-visible:ring-primary/40"
                    />

                    <div className="flex min-h-[52px] w-full flex-col justify-center gap-0.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 transition hover:border-neutral-300 hover:bg-neutral-50/80">
                      <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                        Max price
                      </span>
                      <FilterPriceSelect
                        variant="max"
                        options={maxPriceOptions}
                        value={filterMaxPrice?.toString() ?? ''}
                        onChange={(value) => setFilterMaxPrice(value ? parseInt(value, 10) : null)}
                        otherBound=""
                        emptyLabel="Any price"
                        aria-label="Filter by maximum price"
                        triggerClassName="min-h-0 w-full justify-between rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-base [&>span]:font-bold [&>span]:text-neutral-900 [&_svg]:text-primary"
                        contentClassName="min-w-[min(100%,var(--radix-popover-trigger-width))] sm:min-w-[240px]"
                      />
                    </div>

                    <div className="col-span-1 w-full min-w-0 sm:col-span-3 md:col-span-1">
                      <Button
                        type="button"
                        onClick={submitSearch}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground flex h-auto min-h-[52px] w-full shrink-0 cursor-pointer rounded-lg px-6 py-3 text-sm font-extrabold tracking-wide uppercase"
                      >
                        Search vans
                      </Button>
                    </div>
                  </div>

                  <div className="px-4 pt-0 pb-2 sm:px-4 sm:pb-3">
                    <button
                      type="button"
                      onClick={() => setMoreFiltersOpen(true)}
                      className="mx-auto flex cursor-pointer items-center gap-2 text-xs font-extrabold tracking-wide text-neutral-900 uppercase sm:text-sm"
                    >
                      <SlidersHorizontal className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                      More filters
                      <ChevronDown className="text-primary size-4 shrink-0" strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                </div>
              ) : null}

              {searchTab === 'ai' ? (
                <div className="flex flex-col gap-3 p-4 lg:items-stretch lg:gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
                    <label className="flex min-h-[52px] min-w-0 flex-1 cursor-text flex-row items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 sm:gap-3">
                      <Sparkles className="text-primary mx-auto size-5 shrink-0 sm:mx-0" strokeWidth={2} aria-hidden />
                      <input
                        type="search"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            applyAiSearch({ q: keyword.trim() });
                          }
                        }}
                        placeholder="Describe the van you want — layout, budget, must-haves…"
                        className="w-full min-w-0 bg-transparent text-base font-semibold text-neutral-900 outline-none placeholder:font-medium placeholder:text-neutral-500"
                        autoComplete="off"
                      />
                    </label>
                    <Button
                      type="button"
                      onClick={() => applyAiSearch({ q: keyword.trim() })}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-auto min-h-[52px] w-full shrink-0 cursor-pointer self-stretch rounded-lg px-6 py-2 text-sm font-extrabold tracking-wide uppercase sm:w-[min(100%,11rem)] sm:min-w-44"
                    >
                      Search vans
                    </Button>
                  </div>

                  <div className="p-4">
                    <button
                      type="button"
                      onClick={() => setAiSearchDialogOpen(true)}
                      className="mx-auto flex cursor-pointer items-center gap-2 text-xs font-extrabold tracking-wide text-neutral-900 uppercase sm:text-sm"
                    >
                      <SlidersHorizontal className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                      More filters
                      <ChevronDown className="text-primary size-4 shrink-0" strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                </div>
              ) : null}

              {searchTab === 'live' && isAvailable ? (
                <div className="mt-6 flex flex-col items-center gap-4 rounded-lg border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-8 text-center sm:mx-4 sm:mb-4 sm:py-10">
                  <Camera className="text-primary size-10" strokeWidth={2} aria-hidden />
                  <p className="max-w-md text-sm leading-relaxed text-neutral-700">
                    Connect with a specialist for a live walkthrough of real inventory - no pressure, just answers.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setSeeLiveDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 cursor-pointer rounded-lg px-8 text-sm font-extrabold tracking-wide uppercase"
                  >
                    Open live showroom
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl scroll-mt-28 px-4 pt-8 sm:px-6 sm:pt-10 md:px-8">
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <h2 className="max-w-xl text-xl leading-tight font-black tracking-wide text-neutral-900 uppercase sm:text-2xl md:text-3xl">
            Handpicked vans. Real deals.
          </h2>
          <Link
            href="/inventory?type=deals"
            className="text-primary hover:text-primary/85 inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start text-xs font-extrabold tracking-wide uppercase sm:self-auto sm:text-sm"
          >
            View all inventory
            <ArrowRight className="size-4 shrink-0" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>

        {error ? (
          <p className="text-destructive mb-6 text-center text-sm">{error}</p>
        ) : loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-muted-foreground size-8" />
          </div>
        ) : units.length === 0 ? (
          <p className="text-muted-foreground mb-6 py-6 text-center text-sm">No units available right now.</p>
        ) : (
          <Carousel
            opts={{
              align: 'start',
              dragFree: false,
              watchDrag: (_api, evt) => {
                const raw = evt.target;
                if (!(raw instanceof Element)) return true;
                return !raw.closest('[data-nested-embla-viewport]');
              },
            }}
            className="relative w-full"
          >
            <CarouselContent>
              {units.map((unit) => (
                <CarouselItem
                  key={unit.id}
                  className="flex min-w-0 basis-[88%] pl-3 sm:basis-[48%] sm:pl-4 md:basis-[38%] lg:basis-[30%] xl:basis-1/4 2xl:pl-4"
                >
                  <LandingDealCard unit={unit} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              variant="outline"
              className="top-1/2 left-2 z-10 size-9 -translate-y-1/2 border-neutral-200 bg-white/95 shadow-sm sm:left-3"
            />
            <CarouselNext
              variant="outline"
              className="top-1/2 right-2 z-10 size-9 -translate-y-1/2 border-neutral-200 bg-white/95 shadow-sm sm:right-3"
            />
          </Carousel>
        )}
      </section>

      {isAvailable && (
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:mt-8 sm:px-6 md:px-8">
          <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:divide-x lg:divide-y-0">
            <div className="flex gap-4">
              <Camera className="text-primary size-12 shrink-0 sm:size-14" strokeWidth={1.5} aria-hidden />
              <div className="flex flex-col">
                <div className="text-xl font-black tracking-wide text-neutral-900 uppercase sm:text-2xl">
                  <span className="block">Walk any van.</span>
                  <span className="block">Live. Right now.</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base">
                  Connect with a specialist and see the van in real time.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-emerald-700">
                  <span
                    className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
                    aria-hidden
                  />
                  <span>
                    {users.length > 0
                      ? `${users.length} ${users.length === 1 ? 'specialist' : 'specialists'} online now`
                      : 'No specialists online'}
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => setSeeLiveDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground mt-6 h-12 w-full max-w-xs cursor-pointer gap-2 rounded-lg px-6 text-sm font-extrabold tracking-wide uppercase sm:w-auto"
                >
                  <Camera className="size-5 shrink-0" strokeWidth={2} aria-hidden />
                  See vans live
                </Button>
              </div>
            </div>

            {users.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]"
                    aria-hidden
                  />
                  <span className="text-xs font-black tracking-wide text-neutral-900 uppercase sm:text-sm">
                    Specialists online now
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-8 sm:justify-start lg:justify-between lg:gap-6">
                  {users.slice(0, 4).map((user) => (
                    <div key={user.username} className="flex flex-col items-center text-center">
                      <div className="relative">
                        <Image
                          src={`/viewpro/public/avatars/${user.avatar}`}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <span
                          className="absolute -right-0.5 -bottom-0.5 size-4 rounded-full border-2 border-white bg-emerald-500"
                          aria-hidden
                        />
                      </div>
                      <p className="mt-3 text-xs font-extrabold tracking-wide text-neutral-900 uppercase">
                        {user.name}
                      </p>
                      <p className="mt-0.5 text-[10px] font-bold tracking-wider text-neutral-500 uppercase sm:text-[11px]">
                        Van specialist
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto mt-6 max-w-7xl px-4 sm:mt-8 sm:px-6 md:px-8">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-200 p-px sm:p-px">
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
            <div className="flex flex-col items-center justify-start gap-2.5 bg-neutral-50/95 px-3 py-6 text-center sm:gap-3 sm:px-4 sm:py-8">
              <Award className="text-primary size-8 shrink-0 sm:size-9" strokeWidth={1.75} aria-hidden />
              <div className="space-y-0.5">
                <p className="text-[11px] font-extrabold tracking-wide text-neutral-800 uppercase sm:text-xs">
                  55+ years
                </p>
                <p className="text-[11px] font-extrabold tracking-wide text-neutral-800 uppercase sm:text-xs">
                  In business
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-start gap-2.5 bg-neutral-50/95 px-3 py-6 text-center sm:gap-3 sm:px-4 sm:py-8">
              <Camera className="text-primary size-8 shrink-0 sm:size-9" strokeWidth={1.75} aria-hidden />
              <div className="space-y-0.5">
                <p className="text-[11px] font-extrabold tracking-wide text-neutral-800 uppercase sm:text-xs">
                  Real inventory
                </p>
                <p className="text-[11px] font-extrabold tracking-wide text-neutral-800 uppercase sm:text-xs">
                  Updated daily
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-2.5 bg-neutral-50/95 px-3 py-6 text-center sm:gap-3 sm:px-4 sm:py-8">
              <Star className="text-primary size-8 shrink-0 sm:size-9" strokeWidth={1.75} aria-hidden />
              <div className="space-y-1">
                <p className="text-[11px] font-extrabold tracking-wide text-neutral-800 uppercase sm:text-xs">
                  4.9 rating
                </p>
                <div className="flex justify-center gap-0.5" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3 shrink-0 fill-amber-500 sm:size-3.5" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-[10px] font-bold tracking-wide text-neutral-600 uppercase sm:text-[11px]">
                  (2,300+ reviews)
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-start gap-2.5 bg-neutral-50/95 px-3 py-6 text-center sm:gap-3 sm:px-4 sm:py-8">
              <MapPin className="text-primary size-8 shrink-0 sm:size-9" strokeWidth={1.75} aria-hidden />
              <div className="space-y-0.5">
                <p className="text-[11px] font-extrabold tracking-wide text-neutral-800 uppercase sm:text-xs">
                  See it live
                </p>
                <p className="text-[11px] font-extrabold tracking-wide text-neutral-800 uppercase sm:text-xs">
                  Walk any van
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-4 py-0 sm:mt-8 sm:px-6 sm:py-2 md:px-8 md:py-4">
        <div className="flex flex-col divide-y divide-neutral-200 sm:flex-row sm:divide-x sm:divide-y-0">
          {(
            [
              {
                key: 'finance',
                Icon: PiggyBank,
                title: 'Easy financing',
                body: 'Get pre-approved.',
              },
              {
                key: 'trade',
                Icon: Cog,
                title: 'Trade-ins welcome',
                body: 'Get top value.',
              },
              {
                key: 'protection',
                Icon: ShieldCheck,
                title: 'RV protection plans',
                body: 'Extended coverage. Travel with confidence.',
              },
            ] as const
          ).map(({ key, Icon, title, body }) => (
            <div key={key} className="flex flex-1 gap-4 px-4 py-2 sm:gap-5 sm:px-6 sm:py-0">
              <Icon className="text-primary size-10 shrink-0 sm:size-11" strokeWidth={1.5} aria-hidden />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-primary text-xs font-black tracking-wide uppercase sm:text-sm">{title}</p>
                <p className="mt-1 text-xs leading-snug text-neutral-700 sm:text-sm">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-6 flex max-w-7xl flex-col items-center sm:mt-8">
        <p className="text-center font-sans text-[11px] font-semibold tracking-[0.22em] text-neutral-800 uppercase sm:text-xs md:text-sm">
          Go further. Stay longer.
        </p>
        <div className="mt-2 flex items-center gap-4 px-4" aria-hidden>
          <div className="bg-primary h-px w-12 shrink-0" />
          <Star className="fill-primary text-primary size-5 shrink-0" strokeWidth={1.5} aria-hidden />
          <div className="bg-primary h-px w-12 shrink-0" />
        </div>
      </section>

      <button
        type="button"
        aria-label="Open Ask RecVan AI"
        onClick={() => setAiChatDialogOpen(true)}
        className="border-border fixed right-4 bottom-6 z-50 flex max-w-[min(100vw-2rem,20rem)] cursor-pointer items-center gap-3 rounded-xl border bg-black p-3 pr-3 text-left shadow-lg transition hover:bg-black/90 sm:right-6 sm:bottom-8 sm:p-4"
      >
        <Sparkles className="size-6 shrink-0 text-white" strokeWidth={2} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-extrabold tracking-wide text-white uppercase">Ask RecVan AI</span>
          <span className="mt-0.5 block text-[11px] leading-snug text-white">Ask anything!</span>
        </span>
      </button>

      <SeeLiveDialog open={seeLiveDialogOpen} onOpenChange={setSeeLiveDialogOpen} featuredUnits={units} />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
      <MoreFiltersDialog
        open={moreFiltersOpen}
        onOpenChange={setMoreFiltersOpen}
        initialMakes={filterMakes}
        initialMaxPrice={filterMaxPrice}
        initialLocations={filterLocations}
        onApply={applyMoreFilters}
      />
      <AiSearchDialog
        open={aiSearchDialogOpen}
        onOpenChange={setAiSearchDialogOpen}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onApply={applyAiSearch}
      />
      <AiChatDialog open={aiChatDialogOpen} onOpenChange={setAiChatDialogOpen} />
    </div>
  );
}
