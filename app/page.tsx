'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  CircleDollarSign,
  Cog,
  MapPin,
  MessageCircle,
  PiggyBank,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Van,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Spinner } from '@/components/ui/spinner';
import { FilterMultiSelect } from '@/components/filter-multi-select';
import { FilterSingleSelect } from '@/components/filter-single-select';
import { FilterPriceSelect } from '@/components/filter-price-select';
import { LocationMultiSelect } from '@/components/location-multi-select';
import { SeeLiveDialog } from '@/components/see-live-dialog';
import { ContactDialog } from '@/components/contact-dialog';
import { MoreFiltersDialog, type MoreFiltersApplyPayload } from '@/components/more-filters-dialog';
import { LandingDealCard } from '@/components/landing-deal-card';
import { useViewProWidget, type ViewProWidgetUser } from '@/components/view-pro-widget-provider';
import { api } from '@/lib/api';
import {
  mapInventoryItem,
  type InventoryListResponse,
  type InventoryPagination,
  type InventoryUnit,
} from '@/lib/types';
import { cn, getMakeOptions, getModelOptions, inventoryTypeOptions, maxPriceOptions } from '@/lib/utils';

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

const YEAR_MIN = 2005;
const YEAR_MAX = new Date().getFullYear() + 1;

function yearSelectItems(): number[] {
  const out: number[] = [];
  for (let y = YEAR_MAX; y >= YEAR_MIN; y--) out.push(y);
  return out;
}

export default function HomePage() {
  const router = useRouter();
  const { isAvailable, users, open } = useViewProWidget();
  const [filterMakes, setFilterMakes] = useState<string[]>([]);
  const [filterModels, setFilterModels] = useState<string[]>([]);
  const [filterLocations, setFilterLocations] = useState<string[]>([]);
  const [filterRvTypes, setFilterRvTypes] = useState<string[]>([]);
  const [filterDriveTrains, setFilterDriveTrains] = useState<string[]>([]);
  const [filterFuels, setFilterFuels] = useState<string[]>([]);
  const [filterInventoryTypes, setFilterInventoryTypes] = useState<string[]>([]);
  const [filterFeatures, setFilterFeatures] = useState<string[]>([]);
  const [filterSleeps, setFilterSleeps] = useState<string | null>(null);
  const [filterMinYear, setFilterMinYear] = useState<string | null>(null);
  const [filterMaxYear, setFilterMaxYear] = useState<string | null>(null);
  const [filterMinPrice, setFilterMinPrice] = useState<number | null>(null);
  const [filterMaxPrice, setFilterMaxPrice] = useState<number | null>(null);
  const [filterMinMileage, setFilterMinMileage] = useState<number | null>(null);
  const [filterMaxMileage, setFilterMaxMileage] = useState<number | null>(null);
  const [inventoryMatchTotal, setInventoryMatchTotal] = useState<number | null>(null);
  const [seeLiveDialogOpen, setSeeLiveDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const submitSearch = useCallback(() => {
    const sp = new URLSearchParams();
    if (filterMakes.length > 0) sp.set('make', filterMakes.join(','));
    if (filterModels.length > 0) sp.set('model', filterModels.join(','));
    if (filterLocations.length > 0) sp.set('location', filterLocations.join(','));
    if (filterRvTypes.length > 0) sp.set('rvType', filterRvTypes.join(','));
    if (filterDriveTrains.length > 0) sp.set('driveTrain', filterDriveTrains.join(','));
    if (filterFuels.length > 0) sp.set('fuel', filterFuels.join(','));
    if (filterFeatures.length > 0) sp.set('feature', filterFeatures.join(','));
    if (filterInventoryTypes.length > 0) sp.set('inventoryType', filterInventoryTypes.join(','));
    if (filterSleeps) sp.set('sleeps', filterSleeps);
    if (filterMinYear) sp.set('minYear', filterMinYear);
    if (filterMaxYear) sp.set('maxYear', filterMaxYear);
    if (filterMinPrice) sp.set('minPrice', filterMinPrice.toString());
    if (filterMaxPrice) sp.set('maxPrice', filterMaxPrice.toString());
    if (filterMinMileage) sp.set('minMileage', filterMinMileage.toString());
    if (filterMaxMileage) sp.set('maxMileage', filterMaxMileage.toString());
    const qs = sp.toString();
    router.push(qs ? `/inventory?${qs}` : '/inventory');
  }, [
    router,
    filterMakes,
    filterModels,
    filterLocations,
    filterRvTypes,
    filterDriveTrains,
    filterFuels,
    filterFeatures,
    filterInventoryTypes,
    filterSleeps,
    filterMinYear,
    filterMaxYear,
    filterMinPrice,
    filterMaxPrice,
    filterMinMileage,
    filterMaxMileage,
  ]);

  const applyMoreFilters = useCallback(
    (payload: MoreFiltersApplyPayload) => {
      const sp = new URLSearchParams();
      if (payload.makes && payload.makes.length > 0) {
        setFilterMakes(payload.makes);
        sp.set('make', payload.makes.join(','));
      }
      if (payload.models && payload.models.length > 0) {
        setFilterModels(payload.models);
        sp.set('model', payload.models.join(','));
      }
      if (payload.locations && payload.locations.length > 0) {
        setFilterLocations(payload.locations);
        sp.set('location', payload.locations.join(','));
      }
      if (payload.rvTypes && payload.rvTypes.length > 0) {
        setFilterRvTypes(payload.rvTypes);
        sp.set('rvType', payload.rvTypes.join(','));
      }
      if (payload.driveTrains && payload.driveTrains.length > 0) {
        setFilterDriveTrains(payload.driveTrains);
        sp.set('driveTrain', payload.driveTrains.join(','));
      }
      if (payload.fuels && payload.fuels.length > 0) {
        setFilterFuels(payload.fuels);
        sp.set('fuel', payload.fuels.join(','));
      }
      if (payload.inventoryTypes && payload.inventoryTypes.length > 0) {
        setFilterInventoryTypes(payload.inventoryTypes);
        sp.set('inventoryType', payload.inventoryTypes.join(','));
      }
      if (payload.features && payload.features.length > 0) {
        setFilterFeatures(payload.features);
        sp.set('feature', payload.features.join(','));
      }
      if (payload.sleeps) {
        setFilterSleeps(payload.sleeps);
        sp.set('sleeps', payload.sleeps);
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
      const qs = sp.toString();
      router.push(qs ? `/inventory?${qs}` : '/inventory');
    },
    [router],
  );

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

  const yearOptions = useMemo<{ label: string; value: string }[]>(
    () => yearSelectItems().map((y) => ({ label: String(y), value: String(y) })),
    [],
  );

  const filterYearValue = filterMinYear && filterMaxYear && filterMinYear === filterMaxYear ? filterMinYear : null;

  const apiQuery = useMemo(() => {
    const query: Record<string, string | number> = {
      currentPage: 1,
      perPage: 1,
      body: 'class-b',
    };
    if (filterMakes.length > 0) query.make = filterMakes.join(',');
    if (filterModels.length > 0) query.model = filterModels.join(',');
    if (filterLocations.length > 0) query.location = filterLocations.join(',');
    if (filterRvTypes.length > 0) query.rvType = filterRvTypes.join(',');
    if (filterDriveTrains.length > 0) query.driveTrain = filterDriveTrains.join(',');
    if (filterFuels.length > 0) query.fuel = filterFuels.join(',');
    if (filterInventoryTypes.length > 0) query.inventoryType = filterInventoryTypes.join(',');
    if (filterFeatures.length > 0) query.features = filterFeatures.join(',');
    if (filterSleeps) query.sleeps = filterSleeps;
    if (filterMinYear) query.minYear = filterMinYear;
    if (filterMaxYear) query.maxYear = filterMaxYear;
    if (filterMinPrice) query.minPrice = filterMinPrice;
    if (filterMaxPrice) query.maxPrice = filterMaxPrice;
    if (filterMinMileage) query.minMileage = filterMinMileage;
    if (filterMaxMileage) query.maxMileage = filterMaxMileage;
    return query;
  }, [
    filterMakes,
    filterModels,
    filterLocations,
    filterRvTypes,
    filterDriveTrains,
    filterFuels,
    filterInventoryTypes,
    filterFeatures,
    filterSleeps,
    filterMinYear,
    filterMaxYear,
    filterMinPrice,
    filterMaxPrice,
    filterMinMileage,
    filterMaxMileage,
  ]);

  useEffect(() => {
    let ignore = false;
    const tid = window.setTimeout(() => {
      api
        .get('inventory', { params: apiQuery })
        .then((res) => {
          if (ignore) return;
          const data = res as unknown as InventoryListResponse;
          setInventoryMatchTotal(data.data.pagination.total);
        })
        .catch(() => {
          if (ignore) return;
          setInventoryMatchTotal(null);
        });
    }, 300);

    return () => {
      ignore = true;
      window.clearTimeout(tid);
    };
  }, [apiQuery]);

  const clearHeroFilters = useCallback(() => {
    setFilterMakes([]);
    setFilterModels([]);
    setFilterLocations([]);
    setFilterRvTypes([]);
    setFilterDriveTrains([]);
    setFilterFuels([]);
    setFilterInventoryTypes([]);
    setFilterFeatures([]);
    setFilterSleeps(null);
    setFilterMinYear(null);
    setFilterMaxYear(null);
    setFilterMinPrice(null);
    setFilterMaxPrice(null);
    setFilterMinMileage(null);
    setFilterMaxMileage(null);
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

            {isAvailable && (
              <div className="mt-6 flex w-full flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
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
              </div>
            )}

            {isAvailable && (
              <div className="mt-4 flex w-full max-w-xl flex-col gap-3 sm:mt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {users.length > 0 ? (
                    <div className="relative flex shrink-0">
                      {users.slice(0, 3).map((user: ViewProWidgetUser, i: number) => (
                        <div
                          key={user.username}
                          className={cn(
                            'relative shrink-0 rounded-full border-2 border-white',
                            i > 0 && '-ml-2',
                            i === 0 && 'z-10',
                            i === 1 && 'z-20',
                            i === 2 && 'z-30',
                          )}
                        >
                          <Image
                            src={`/viewpro/public/avatars/${user.avatar}`}
                            alt=""
                            width={48}
                            height={48}
                            className="size-10 rounded-full object-cover sm:size-12"
                          />
                          {i === Math.min(users.length, 3) - 1 && (
                            <span
                              className="absolute -right-0.5 -bottom-0.5 z-40 size-2.5 rounded-full border-2 border-white bg-emerald-400 sm:size-3"
                              aria-hidden
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-white sm:size-12">
                      <Image src="/images/robot.png" alt="" fill sizes="48px" className="object-cover" />
                      <span
                        className="absolute -right-0.5 -bottom-0.5 z-10 size-2.5 rounded-full border-2 border-white bg-emerald-400 sm:size-3"
                        aria-hidden
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold tracking-wide text-black uppercase sm:text-sm">
                      {users.length > 0
                        ? `${users.length} ${users.length === 1 ? 'specialist' : 'specialists'} online`
                        : 'Specialists on standby'}
                    </p>
                    <p className="mt-0.5 text-xs text-black/90 sm:text-sm">
                      Average connect time: <span className="font-semibold text-emerald-400">42 sec</span>
                    </p>
                  </div>
                </div>
                <div
                  onClick={open}
                  className="flex shrink-0 cursor-pointer flex-row gap-3 rounded-xl border border-white/70 bg-black/70 px-4 py-3 sm:min-w-[200px]"
                >
                  <div className="flex flex-col justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_2px_rgba(74,222,128,0.35)]"
                        aria-hidden
                      />
                      <span className="text-xs font-extrabold tracking-wide text-white uppercase sm:text-sm">
                        Vans live right now
                      </span>
                    </div>
                    <p className="text-xs text-white/85 sm:text-sm">Walk any van from anywhere</p>
                  </div>
                  <span className="text-3xl font-black text-emerald-400 tabular-nums sm:text-4xl">
                    {users.length > 0 ? users.length : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div id="home-search" className="relative z-20 mt-8 w-full shrink-0 scroll-mt-24 sm:mt-10 md:mt-12">
            <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-[0_22px_50px_-12px_rgba(0,0,0,0.18)] sm:p-5 lg:gap-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-black tracking-wide text-neutral-900 uppercase sm:text-lg">
                  Find your van
                </h2>
                <button
                  type="button"
                  onClick={clearHeroFilters}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-semibold text-neutral-600 transition hover:text-neutral-900 sm:text-sm"
                >
                  Clear all
                  <RotateCcw className="size-3.5 shrink-0 text-neutral-500 sm:size-4" strokeWidth={2} aria-hidden />
                </button>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3">
                <div className="flex min-h-18 w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition hover:border-neutral-300 hover:bg-neutral-50/80 sm:min-h-19">
                  <Van className="size-5 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">Make</span>
                    <FilterMultiSelect
                      options={getMakeOptions({ body: 'class-b' })}
                      selected={filterMakes}
                      onChange={setFilterMakes}
                      allLabel="Any Make"
                      countNoun="makes"
                      aria-label="Filter by make"
                      triggerClassName="min-h-0 w-full justify-between gap-2 rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-base [&>span]:font-bold [&>span]:text-neutral-900 [&_svg]:text-neutral-500"
                      contentClassName="min-w-[min(100%,var(--radix-popover-trigger-width))] sm:min-w-[240px]"
                    />
                  </div>
                </div>

                <div className="flex min-h-18 w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition hover:border-neutral-300 hover:bg-neutral-50/80 sm:min-h-19">
                  <Search className="size-5 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">Model</span>
                    <FilterMultiSelect
                      options={getModelOptions({ body: 'class-b' })}
                      selected={filterModels}
                      onChange={setFilterModels}
                      allLabel="Any Model"
                      countNoun="models"
                      aria-label="Filter by model"
                      triggerClassName="min-h-0 w-full justify-between gap-2 rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-base [&>span]:font-bold [&>span]:text-neutral-900 [&_svg]:text-neutral-500"
                      contentClassName="min-w-[min(100%,var(--radix-popover-trigger-width))] sm:min-w-[240px]"
                    />
                  </div>
                </div>

                <div className="flex min-h-18 w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition hover:border-neutral-300 hover:bg-neutral-50/80 sm:min-h-19">
                  <Tag className="size-5 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                      New / Used
                    </span>
                    <FilterMultiSelect
                      options={inventoryTypeOptions}
                      selected={filterInventoryTypes}
                      onChange={setFilterInventoryTypes}
                      allLabel="Any"
                      countNoun="conditions"
                      aria-label="New or used inventory"
                      triggerClassName="min-h-0 w-full justify-between gap-2 rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-base [&>span]:font-bold [&>span]:text-neutral-900 [&_svg]:text-neutral-500"
                      contentClassName="min-w-[min(100%,var(--radix-popover-trigger-width))] sm:min-w-[240px]"
                    />
                  </div>
                </div>

                <div className="flex min-h-18 w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition hover:border-neutral-300 hover:bg-neutral-50/80 sm:min-h-19">
                  <Calendar className="size-5 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">Year</span>
                    <FilterSingleSelect
                      options={yearOptions}
                      value={filterYearValue}
                      onChange={(v) => {
                        if (v == null) {
                          setFilterMinYear(null);
                          setFilterMaxYear(null);
                        } else {
                          setFilterMinYear(v);
                          setFilterMaxYear(v);
                        }
                      }}
                      emptyLabel="Any Year"
                      aria-label="Filter by year"
                      triggerClassName="min-h-0 w-full justify-between gap-2 rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-base [&>span]:font-bold [&>span]:text-neutral-900 [&_svg]:text-neutral-500"
                      contentClassName="min-w-[min(100%,var(--radix-popover-trigger-width))] sm:min-w-[240px]"
                    />
                  </div>
                </div>

                <div className="flex min-h-18 w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition hover:border-neutral-300 hover:bg-neutral-50/80 sm:min-h-19">
                  <CircleDollarSign className="size-5 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">Price</span>
                    <FilterPriceSelect
                      variant="max"
                      options={maxPriceOptions}
                      value={filterMaxPrice?.toString() ?? ''}
                      onChange={(value) => setFilterMaxPrice(value ? parseInt(value, 10) : null)}
                      otherBound=""
                      emptyLabel="Any Price"
                      aria-label="Filter by maximum price"
                      triggerClassName="min-h-0 w-full justify-between gap-2 rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-base [&>span]:font-bold [&>span]:text-neutral-900 [&_svg]:text-neutral-500"
                      contentClassName="min-w-[min(100%,var(--radix-popover-trigger-width))] sm:min-w-[240px]"
                    />
                  </div>
                </div>

                <div className="flex min-h-18 w-full items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition hover:border-neutral-300 hover:bg-neutral-50/80 sm:min-h-19">
                  <MapPin className="size-5 shrink-0 text-neutral-400" strokeWidth={2} aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                      Location
                    </span>
                    <LocationMultiSelect
                      selected={filterLocations}
                      onChange={setFilterLocations}
                      emptySummaryLabel="Nationwide"
                      triggerClassName="min-h-0 w-full flex-row items-center justify-between gap-2 rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-2 focus-visible:ring-primary/40 [&>span]:text-base [&>span]:font-bold [&>span]:text-neutral-900 [&_svg]:text-neutral-500"
                      contentClassName="min-w-[min(100%,var(--radix-popover-trigger-width))] sm:min-w-[260px]"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={submitSearch}
                className="flex h-auto min-h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border-0 bg-[#B57D3E] px-4 py-3.5 text-sm font-black tracking-wide text-white uppercase shadow-none hover:bg-[#a06f35] focus-visible:ring-white/40"
              >
                <span className="min-w-0 flex-1 text-center">
                  {inventoryMatchTotal != null
                    ? `View inventory (${inventoryMatchTotal.toLocaleString('en-US')} vans)`
                    : 'View inventory'}
                </span>
                <ArrowRight className="size-5 shrink-0 text-white" strokeWidth={2.5} aria-hidden />
              </Button>

              <div className="flex justify-center pt-0 pb-0">
                <button
                  type="button"
                  onClick={() => setMoreFiltersOpen(true)}
                  className="flex cursor-pointer items-center gap-2 text-xs font-extrabold tracking-wide text-neutral-900 uppercase sm:text-sm"
                >
                  <SlidersHorizontal className="size-4 shrink-0 text-neutral-500" strokeWidth={2} aria-hidden />
                  More Filters
                  <ChevronDown className="size-4 shrink-0 text-neutral-500" strokeWidth={2} aria-hidden />
                </button>
              </div>
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
        onClick={() => {}}
        className="border-border fixed right-4 bottom-6 z-50 flex max-w-[min(100vw-2rem,20rem)] cursor-pointer items-center gap-3 rounded-xl border bg-black p-3 pr-3 text-left shadow-lg transition hover:bg-black/90 sm:right-6 sm:bottom-8 sm:p-4"
      >
        <Sparkles className="size-6 shrink-0 text-white" strokeWidth={2} aria-hidden />
      </button>

      <SeeLiveDialog open={seeLiveDialogOpen} onOpenChange={setSeeLiveDialogOpen} featuredUnits={units} />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
      <MoreFiltersDialog
        open={moreFiltersOpen}
        onOpenChange={setMoreFiltersOpen}
        makes={filterMakes}
        models={filterModels}
        locations={filterLocations}
        rvTypes={filterRvTypes}
        driveTrains={filterDriveTrains}
        fuels={filterFuels}
        inventoryTypes={filterInventoryTypes}
        features={filterFeatures}
        sleeps={filterSleeps}
        minYear={filterMinYear}
        maxYear={filterMaxYear}
        minPrice={filterMinPrice}
        maxPrice={filterMaxPrice}
        minMileage={filterMinMileage}
        maxMileage={filterMaxMileage}
        setMakes={setFilterMakes}
        setModels={setFilterModels}
        setLocations={setFilterLocations}
        setRvTypes={setFilterRvTypes}
        setDriveTrains={setFilterDriveTrains}
        setFuels={setFilterFuels}
        setInventoryTypes={setFilterInventoryTypes}
        setFeatures={setFilterFeatures}
        setSleeps={setFilterSleeps}
        setMinYear={setFilterMinYear}
        setMaxYear={setFilterMaxYear}
        setMinPrice={setFilterMinPrice}
        setMaxPrice={setFilterMaxPrice}
        setMinMileage={setFilterMinMileage}
        setMaxMileage={setFilterMaxMileage}
        totalCount={inventoryMatchTotal}
        onApply={applyMoreFilters}
      />
    </div>
  );
}
