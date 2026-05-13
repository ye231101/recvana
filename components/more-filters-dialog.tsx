'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { api } from '@/lib/api';
import {
  cn,
  formatMileage,
  formatPrice,
  rvTypeOptions,
  sleepOptions,
  driveTrainOptions,
  fuelOptions,
  featureOptions,
} from '@/lib/utils';
import type { InventoryListResponse } from '@/lib/types';

const YEAR_MIN = 2005;
const YEAR_MAX = new Date().getFullYear() + 1;

function yearSelectItems(): number[] {
  const out: number[] = [];
  for (let y = YEAR_MAX; y >= YEAR_MIN; y--) out.push(y);
  return out;
}

export type MoreFiltersApplyPayload = {
  makes?: string[];
  rvTypes?: string[];
  sleeps?: string | null;
  driveTrains?: string[];
  fuels?: string[];
  features?: string[];
  minYear?: string | null;
  maxYear?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minMileage?: number | null;
  maxMileage?: number | null;
  locations?: string[];
};

type MoreFiltersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMakes: string[];
  initialMaxPrice: number | null;
  initialLocations: string[];
  onApply: (payload: MoreFiltersApplyPayload) => void;
};

export function MoreFiltersDialog({
  open,
  onOpenChange,
  initialMakes,
  initialMaxPrice,
  initialLocations,
  onApply,
}: MoreFiltersDialogProps) {
  const [makes, setMakes] = useState<string[]>([]);
  const [rvTypes, setRvTypes] = useState<string[]>([]);
  const [sleeps, setSleeps] = useState<string | null>(null);
  const [driveTrains, setDriveTrains] = useState<string[]>([]);
  const [fuels, setFuels] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [minYear, setMinYear] = useState<string | null>(null);
  const [maxYear, setMaxYear] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10_000_000);
  const [minMileage, setMinMileage] = useState<number>(0);
  const [maxMileage, setMaxMileage] = useState<number>(1_000_000);
  const [locations, setLocations] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMakes(initialMakes);
    setRvTypes([]);
    setSleeps(null);
    setDriveTrains([]);
    setFuels([]);
    setFeatures([]);
    setMinYear(null);
    setMaxYear(null);
    setMinPrice(0);
    setMaxPrice(initialMaxPrice ?? 1_000_000);
    setMinMileage(0);
    setMaxMileage(150_000);
    setLocations(initialLocations);
  }, [open, initialMakes, initialMaxPrice, initialLocations]);

  const apiQuery = useMemo(() => {
    const query: Record<string, string | number> = {
      currentPage: 1,
      perPage: 1,
      body: 'class-b',
    };
    if (makes.length > 0) query.make = makes.join(',');
    if (rvTypes.length > 0) query.rvType = rvTypes.join(',');
    if (sleeps) query.sleeps = sleeps;
    if (driveTrains.length > 0) query.driveTrain = driveTrains.join(',');
    if (fuels.length > 0) query.fuel = fuels.join(',');
    if (features.length > 0) query.feature = features.join(',');
    if (minYear) query.minYear = minYear;
    if (maxYear) query.maxYear = maxYear;
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;
    if (minMileage) query.minMileage = minMileage;
    if (maxMileage) query.maxMileage = maxMileage;
    if (locations.length > 0) query.location = locations.join(',');
    return query;
  }, [
    makes,
    rvTypes,
    sleeps,
    driveTrains,
    fuels,
    features,
    minYear,
    maxYear,
    minPrice,
    maxPrice,
    minMileage,
    maxMileage,
    locations,
  ]);

  useEffect(() => {
    if (!open) return;
    let ignore = false;
    const t = window.setTimeout(() => {
      setCountLoading(true);
      api
        .get('inventory', { params: apiQuery })
        .then((res) => {
          if (ignore) return;
          const data = res as unknown as InventoryListResponse;
          setMatchCount(data.data.pagination.total);
        })
        .catch(() => {
          if (ignore) return;
          setMatchCount(null);
        })
        .finally(() => {
          if (!ignore) setCountLoading(false);
        });
    }, 320);
    return () => {
      ignore = true;
      window.clearTimeout(t);
    };
  }, [open, apiQuery]);

  const toggleFeature = (f: string) => {
    setFeatures((prev) => {
      if (prev.includes(f)) return prev.filter((v) => v !== f);
      return [...prev, f];
    });
  };

  const resetAll = useCallback(() => {
    setMakes([]);
    setRvTypes([]);
    setSleeps(null);
    setDriveTrains([]);
    setFuels([]);
    setFeatures([]);
    setMinYear(null);
    setMaxYear(null);
    setMinPrice(0);
    setMaxPrice(1_000_000);
    setMinMileage(0);
    setMaxMileage(150_000);
    setLocations([]);
  }, []);

  const handleApply = () => {
    onApply({
      makes,
      rvTypes,
      sleeps,
      driveTrains,
      fuels,
      features,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      minMileage,
      maxMileage,
      locations,
    });
    onOpenChange(false);
  };

  const sectionTitle = (text: string) => (
    <p className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">{text}</p>
  );

  const pillToggle = (selected: boolean, onClick: () => void, label: string) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3',
        selected
          ? 'border-neutral-900 bg-neutral-900 text-white'
          : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400',
      )}
    >
      {label}
    </button>
  );

  const years = useMemo(() => yearSelectItems(), []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="max-h-[min(90vh,calc(100%-2rem))] w-full max-w-4xl gap-0 overflow-y-auto rounded-lg border-neutral-200 p-0 sm:max-w-4xl"
      >
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-5 py-4 sm:px-6">
          <DialogTitle className="flex flex-1 items-center justify-center gap-2 text-center text-base font-bold tracking-wide text-neutral-900 sm:text-lg">
            <SlidersHorizontal className="size-5 shrink-0" strokeWidth={2} aria-hidden />
            <span>More Filters</span>
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div className="space-y-4 divide-y divide-neutral-200">
          <div className="grid gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,4fr)_minmax(0,3fr)] lg:gap-8">
            <div className="min-w-0">
              {sectionTitle('Van type')}
              <div className="mt-3 space-y-3">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <Checkbox
                    checked={rvTypes.length === 0}
                    onCheckedChange={(c) => {
                      if (c === true) setRvTypes([]);
                    }}
                    className="border-neutral-400 data-[state=checked]:border-neutral-900 data-[state=checked]:bg-neutral-900 data-[state=checked]:text-white"
                  />
                  <span className="text-sm font-medium text-neutral-900">Any Types</span>
                </label>
                {rvTypeOptions.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
                    <Checkbox
                      checked={rvTypes.includes(opt.value)}
                      onCheckedChange={() => {
                        setRvTypes((prev) => {
                          if (prev.includes(opt.value)) return prev.filter((v) => v !== opt.value);
                          return [...prev, opt.value];
                        });
                      }}
                      className="border-neutral-400 data-[state=checked]:border-neutral-900 data-[state=checked]:bg-neutral-900 data-[state=checked]:text-white"
                    />
                    <span className="text-sm font-medium text-neutral-900">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              {sectionTitle('Sleeps')}
              <div className="mt-3 flex flex-wrap gap-2">
                <span>{pillToggle(sleeps === null, () => setSleeps(null), 'Any')}</span>
                {sleepOptions.map((opt) => (
                  <span key={opt.value}>
                    {pillToggle(sleeps === opt.value, () => setSleeps(opt.value), opt.label)}
                  </span>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              {sectionTitle('Drive train')}
              <div className="mt-3 space-y-3">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <Checkbox
                    checked={driveTrains.length === 0}
                    onCheckedChange={(c) => {
                      if (c === true) setDriveTrains([]);
                    }}
                    className="border-neutral-400 data-[state=checked]:border-neutral-900 data-[state=checked]:bg-neutral-900 data-[state=checked]:text-white"
                  />
                  <span className="text-sm font-medium text-neutral-900">Any</span>
                </label>
                {driveTrainOptions.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
                    <Checkbox
                      checked={driveTrains.includes(opt.value)}
                      onCheckedChange={() => {
                        setDriveTrains((prev) => {
                          if (prev.includes(opt.value)) return prev.filter((v) => v !== opt.value);
                          return [...prev, opt.value];
                        });
                      }}
                      className="border-neutral-400 data-[state=checked]:border-neutral-900 data-[state=checked]:bg-neutral-900 data-[state=checked]:text-white"
                    />
                    <span className="text-sm font-medium text-neutral-900">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,4fr)_minmax(0,3fr)] lg:gap-8">
            <div className="min-w-0">
              {sectionTitle('Fuel type')}
              <div className="mt-3 space-y-3">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <Checkbox
                    checked={fuels.length === 0}
                    onCheckedChange={(c) => {
                      if (c === true) setFuels([]);
                    }}
                    className="border-neutral-400 data-[state=checked]:border-neutral-900 data-[state=checked]:bg-neutral-900 data-[state=checked]:text-white"
                  />
                  <span className="text-sm font-medium text-neutral-900">Any</span>
                </label>
                {fuelOptions.map((opt) => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
                    <Checkbox
                      checked={fuels.includes(opt.value)}
                      onCheckedChange={() => {
                        setFuels((prev) => {
                          if (prev.includes(opt.value)) return prev.filter((v) => v !== opt.value);
                          return [...prev, opt.value];
                        });
                      }}
                      className="border-neutral-400 data-[state=checked]:border-neutral-900 data-[state=checked]:bg-neutral-900 data-[state=checked]:text-white"
                    />
                    <span className="text-sm font-medium text-neutral-900 capitalize">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              {sectionTitle('Features')}
              <div className="mt-3 flex flex-wrap gap-2">
                {featureOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleFeature(opt.value)}
                    className={cn(
                      'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                      features.includes(opt.value)
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              {sectionTitle('Year')}
              <div className="mt-3 flex flex-col gap-2">
                <Select value={minYear || 'none-min'} onValueChange={(v) => setMinYear(v === 'none-min' ? null : v)}>
                  <SelectTrigger className="h-10 w-full rounded-md border-neutral-200 bg-white font-medium text-neutral-900">
                    <SelectValue placeholder="Min Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none-min">Min Year</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={`min-${y}`} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={maxYear || 'none-max'} onValueChange={(v) => setMaxYear(v === 'none-max' ? '' : v)}>
                  <SelectTrigger className="h-10 w-full rounded-md border-neutral-200 bg-white font-medium text-neutral-900">
                    <SelectValue placeholder="Max Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none-max">Max Year</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={`max-${y}`} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-4 py-4 pt-6 sm:px-6 lg:grid-cols-2 lg:gap-8">
            <div>
              {sectionTitle('Price range')}
              <div className="mt-4 px-0.5">
                <Slider
                  min={0}
                  max={1_000_000}
                  step={5000}
                  value={[minPrice, maxPrice]}
                  onValueChange={(v) => {
                    setMinPrice(v[0]);
                    setMaxPrice(v[1]);
                  }}
                  className="py-1 [&_[data-slot=slider-range]]:bg-neutral-900 [&_[data-slot=slider-thumb]]:border-neutral-900 [&_[data-slot=slider-thumb]]:ring-neutral-300/50 [&_[data-slot=slider-thumb]]:hover:ring-neutral-300/50 [&_[data-slot=slider-thumb]]:focus:ring-neutral-300/50 [&_[data-slot=slider-thumb]]:focus-visible:ring-neutral-300/50"
                />
                <div className="mt-2 flex justify-between text-xs font-medium text-neutral-600">
                  <span>{formatPrice(minPrice)}</span>
                  <span>{formatPrice(1_000_000)}</span>
                </div>
              </div>
            </div>

            <div>
              {sectionTitle('Mileage')}
              <div className="mt-4 px-0.5">
                <Slider
                  min={0}
                  max={150_000}
                  step={5000}
                  value={[minMileage, maxMileage]}
                  onValueChange={(v) => {
                    setMinMileage(v[0]);
                    setMaxMileage(v[1]);
                  }}
                  className="py-1 [&_[data-slot=slider-range]]:bg-neutral-900 [&_[data-slot=slider-thumb]]:border-neutral-900 [&_[data-slot=slider-thumb]]:ring-neutral-300/50 [&_[data-slot=slider-thumb]]:hover:ring-neutral-300/50 [&_[data-slot=slider-thumb]]:focus:ring-neutral-300/50 [&_[data-slot=slider-thumb]]:focus-visible:ring-neutral-300/50"
                />
                <div className="mt-2 flex justify-between text-xs font-medium text-neutral-600">
                  <span>{formatMileage(minMileage)}</span>
                  <span>{formatMileage(maxMileage)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={resetAll}
            className="h-11 cursor-pointer border-neutral-900 bg-white font-semibold text-neutral-900 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <RotateCcw className="mr-2 size-4" aria-hidden />
            Reset Filters
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="h-11 cursor-pointer bg-neutral-900 px-6 font-semibold text-white hover:bg-neutral-800"
          >
            Apply Filters
            {countLoading ? (
              <span className="ml-1 opacity-80">…</span>
            ) : matchCount != null ? (
              <span className="ml-1 tabular-nums">
                ({matchCount.toLocaleString('en-US')} {matchCount === 1 ? 'Van' : 'Vans'})
              </span>
            ) : null}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
