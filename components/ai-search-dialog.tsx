'use client';

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { AlertTriangle, BatteryCharging, BedDouble, Search, Sparkles, UsersRound, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FilterMultiSelect } from '@/components/filter-multi-select';
import { FilterSingleSelect } from '@/components/filter-single-select';
import { FilterPriceSelect } from '@/components/filter-price-select';
import { cn, driveTrainOptions, featureOptions, minPriceOptions, sleepOptions } from '@/lib/utils';

const MAX_LEN = 200;

export type AiSearchApplyPayload = {
  q: string;
  minPrice?: number | null;
  sleeps?: string | null;
  driveTrains?: string[];
  features?: string[];
  inStockOnly?: boolean;
};

type AiSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyword: string;
  onKeywordChange: Dispatch<SetStateAction<string>>;
  onApply: (payload: AiSearchApplyPayload) => void;
};

const quickPresets = [
  {
    key: 'weekend',
    label: 'Weekend camping',
    text: 'Weekend camping trips, compact layout, easy to park.',
    Icon: AlertTriangle,
  },
  {
    key: 'fulltime',
    label: 'Full-time living',
    text: 'Full-time living, maximum storage, comfortable galley.',
    Icon: BedDouble,
  },
  {
    key: 'offgrid',
    label: 'Off-grid',
    text: 'Off-grid capable with solar, lithium batteries, and inverter.',
    Icon: BatteryCharging,
  },
  {
    key: 'family',
    label: 'Family travel',
    text: 'Family travel with seating and sleeping for four or more.',
    Icon: UsersRound,
  },
] as const;

const popularSearches = ['4x4 Adventure Van', 'Off-Grid with Solar', 'Couples Van', 'Family Road Trip'] as const;

export function AiSearchDialog({ open, onOpenChange, keyword, onKeywordChange, onApply }: AiSearchDialogProps) {
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [sleeps, setSleeps] = useState<string | null>(null);
  const [driveTrains, setDriveTrains] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(true);

  useEffect(() => {
    if (!open) {
      setMinPrice(null);
      setSleeps(null);
      setDriveTrains([]);
      setFeatures([]);
      setInStockOnly(true);
    }
  }, [open]);

  const handleKeywordInput = useCallback(
    (value: string) => {
      onKeywordChange(value.slice(0, MAX_LEN));
    },
    [onKeywordChange],
  );

  const handleFind = useCallback(() => {
    const q = keyword.trim();
    onApply({ q, minPrice, sleeps, driveTrains, features, inStockOnly });
    onOpenChange(false);
  }, [keyword, minPrice, sleeps, driveTrains, features, inStockOnly, onApply, onOpenChange]);

  const len = keyword.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="max-h-[min(90vh,calc(100%-2rem))] w-full max-w-4xl min-w-0 gap-0 overflow-y-auto rounded-lg border-neutral-200 p-0 sm:max-w-4xl"
      >
        <div className="flex items-center justify-between gap-2 border-b border-neutral-200 px-5 py-4 sm:px-6">
          <DialogTitle className="flex flex-1 items-center justify-center gap-2 text-center text-base font-bold tracking-wide text-neutral-900 sm:text-lg">
            <Sparkles className="size-5 shrink-0" strokeWidth={2} aria-hidden />
            <span>AI Assisted Search</span>
            <Badge className="border-sky-200/90 bg-sky-100 px-2 py-0 text-[10px] font-extrabold tracking-wide text-sky-900 uppercase">
              BETA
            </Badge>
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

        <div className="px-6 pt-6 pb-4">
          <h2 className="text-center text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            Tell us what you&apos;re looking for.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-neutral-600">
            Describe your ideal van and AI will find the best matches.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {quickPresets.map(({ key, label, text, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onKeywordChange((prev) => {
                    const p = prev.slice(0, MAX_LEN);
                    return p.trim().length === 0 ? text : `${p.trim()} ${text}`.slice(0, MAX_LEN);
                  });
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-left text-xs font-semibold text-neutral-800 shadow-sm transition',
                  'hover:border-neutral-300 hover:bg-neutral-50',
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                {label}
              </button>
            ))}
          </div>

          <div className="relative mt-5">
            <Textarea
              value={keyword}
              maxLength={MAX_LEN}
              onChange={(e) => handleKeywordInput(e.target.value)}
              placeholder="Example: I want a 4x4 van under $150k with solar, king bed, and a shower."
              className="min-h-[120px] resize-none rounded-2xl border-neutral-200 bg-white pr-14 text-sm placeholder:text-neutral-400"
              aria-label="Describe the van you want"
            />
            <span className="pointer-events-none absolute right-3 bottom-3 text-xs text-neutral-400 tabular-nums">
              {len}/{MAX_LEN}
            </span>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-neutral-900">Refine your search (optional)</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">Budget</Label>
                <div className="flex h-11 w-full items-center rounded-xl border border-neutral-200 bg-white px-3">
                  <FilterPriceSelect
                    variant="min"
                    options={minPriceOptions}
                    value={minPrice?.toString() ?? ''}
                    onChange={(v) => setMinPrice(v ? parseInt(v, 10) : null)}
                    otherBound=""
                    emptyLabel="Any"
                    aria-label="Budget"
                    triggerClassName="min-h-0 h-full w-full justify-between rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-sm [&>span]:font-medium [&>span]:text-neutral-900"
                    contentClassName="min-w-[280px]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">Sleeps</Label>
                <div className="flex h-11 w-full items-center rounded-xl border border-neutral-200 bg-white px-3">
                  <FilterSingleSelect
                    options={sleepOptions}
                    value={sleeps}
                    onChange={setSleeps}
                    emptyLabel="Any"
                    aria-label="Sleeps"
                    triggerClassName="min-h-0 h-full w-full justify-between rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-sm [&>span]:font-medium [&>span]:text-neutral-900"
                    contentClassName="min-w-[280px]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                  Drive Trains
                </Label>
                <div className="flex h-11 w-full items-center rounded-xl border border-neutral-200 bg-white px-3">
                  <FilterMultiSelect
                    options={driveTrainOptions}
                    selected={driveTrains}
                    onChange={setDriveTrains}
                    allLabel="Any"
                    countNoun="drive trains"
                    aria-label="Drive trains"
                    triggerClassName="min-h-0 h-full w-full justify-between rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-sm [&>span]:font-medium [&>span]:text-neutral-900"
                    contentClassName="min-w-[280px]"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">Features</Label>
                <div className="flex h-11 w-full items-center rounded-xl border border-neutral-200 bg-white px-3">
                  <FilterMultiSelect
                    options={featureOptions}
                    selected={features}
                    onChange={setFeatures}
                    allLabel="Any"
                    countNoun="features"
                    aria-label="Features"
                    triggerClassName="min-h-0 h-full w-full justify-between rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent focus-visible:ring-0 [&>span]:text-sm [&>span]:font-medium [&>span]:text-neutral-900"
                    contentClassName="min-w-[280px]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 bg-neutral-50/80 px-4 py-3">
              <Label htmlFor="ai-in-stock" className="cursor-pointer text-sm font-medium text-neutral-800">
                Show only vans in stock
              </Label>
              <Switch
                id="ai-in-stock"
                checked={inStockOnly}
                onCheckedChange={setInStockOnly}
                className="data-[state=checked]:bg-black"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleFind}
            className="mt-6 h-12 w-full cursor-pointer rounded-2xl bg-neutral-900 text-sm font-extrabold tracking-wide text-white uppercase hover:bg-neutral-800"
          >
            <Sparkles className="mr-2 size-4 shrink-0" strokeWidth={2} aria-hidden />
            Find My Vans
          </Button>
          <p className="mt-3 text-center text-[11px] text-neutral-500">Powered by AI. Personalized for you.</p>
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50/50 px-6 py-5">
          <p className="text-xs font-semibold text-neutral-700">Popular searches</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {popularSearches.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => onKeywordChange(label.slice(0, MAX_LEN))}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <Search className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
