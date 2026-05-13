'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowRight,
  Bus,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cog,
  Fuel,
  Gauge,
  MessageCircle,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
  User,
  Video,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { AiChatDialog } from '@/components/ai-chat-dialog';
import { ContactDialog } from '@/components/contact-dialog';
import { useViewProWidget, type ViewProWidgetUser } from '@/components/view-pro-widget-provider';
import {
  cn,
  formatMileage,
  formatSleeps,
  formatPrice,
  rebateEndsLabel,
  labelFromCustomTags,
  getInventoryPricing,
} from '@/lib/utils';
import type { InventoryUnit } from '@/lib/types';

const APR_RATE = 7.99;
const PAYMENT_ESTIMATE_TERM_MONTHS = 240;

function TabPanelCard({
  title,
  children,
  footer,
  contentClassName,
}: {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-neutral-200/95 bg-white shadow-sm">
      <div className="flex flex-col">
        <div className="px-4 py-6 sm:px-6 sm:py-8">
          {title && <h2 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">{title}</h2>}
          <div className={cn('mt-4 text-[15px] leading-relaxed text-neutral-700 md:text-base', contentClassName)}>
            {children}
          </div>
        </div>
        {footer}
      </div>
    </section>
  );
}

function monthlyPayment(principal: number, annualApr: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualApr / 100 / 12;
  if (r <= 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function InventoryDetail({ unit }: { unit: InventoryUnit }) {
  const { isAvailable, users, open } = useViewProWidget();

  const [financePrice, setFinancePrice] = useState(0);
  const [financeDown, setFinanceDown] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [floorplanDialogOpen, setFloorplanDialogOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  // const [aiChatDialogOpen, setAiChatDialogOpen] = useState(false);

  const [slideIndex, setSlideIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const slides = useMemo(() => {
    const base =
      unit.images && unit.images.length > 0
        ? unit.images
        : unit.defaultImageUrl
          ? [unit.defaultImageUrl]
          : ['/images/photos_coming_soon.jpg'];
    return base;
  }, [unit.images, unit.defaultImageUrl]);

  const floorplanSrc = slides[slides.length - 1];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSlideIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const el = thumbRefs.current[slideIndex];
    if (!el) return;
    el.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [slideIndex, slides.length]);

  useEffect(() => {
    document.title = `${unit.title} | RECVAN`;
    return () => {
      document.title = 'RECVAN';
    };
  }, [unit.title]);

  const { msrp, displayPrice, savingAmount, isTooLowToShow, showDetailedBreakdown } = getInventoryPricing(unit);

  const rebateFootnote = showDetailedBreakdown && unit.rebate ? rebateEndsLabel(unit.rebate.enddate) : null;
  const chassisLabel = labelFromCustomTags(unit.customTags, 'chassis');
  const rvTypeLabel = labelFromCustomTags(unit.customTags, 'rvType');
  const driveTrainLabel = labelFromCustomTags(unit.customTags, 'driveTrain');
  const sleepsLabel = formatSleeps(unit.sleepsCount);

  useEffect(() => {
    setFinancePrice(Math.round(displayPrice));
    setFinanceDown(Math.round(displayPrice * 0.1));
  }, [displayPrice, unit.id]);

  const downPayment = Math.min(financeDown, financePrice);
  const principal = Math.max(0, financePrice - downPayment);
  const estimatedMonthly = monthlyPayment(principal, APR_RATE, PAYMENT_ESTIMATE_TERM_MONTHS);

  const quickHeroSpecs = [
    rvTypeLabel ? `${rvTypeLabel}` : null,
    chassisLabel ? `${chassisLabel}` : null,
    driveTrainLabel ? `${driveTrainLabel}` : null,
    sleepsLabel ? `${sleepsLabel}` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  const loveParagraph = (() => {
    const bits: string[] = [`${unit.title} is built for adventure.`];
    const withParts: string[] = [];
    if (driveTrainLabel) withParts.push(`${driveTrainLabel.toLowerCase()} drive`);
    if (unit.wI_Fuel) withParts.push(`a powerful ${unit.wI_Fuel.toLowerCase()} engine`);
    if (unit.wI_Length) withParts.push(`a rugged yet refined ${unit.wI_Length} ft interior`);
    if (withParts.length > 0) {
      const joined =
        withParts.length === 1
          ? withParts[0]
          : withParts.length === 2
            ? `${withParts[0]} and ${withParts[1]}`
            : `${withParts.slice(0, -1).join(', ')}, and ${withParts[withParts.length - 1]}`;
      bits.push(` With ${joined}, it's ready to take you anywhere in comfort and style.`);
    } else {
      bits.push(` It's ready to take you anywhere in comfort and style.`);
    }
    return bits.join('');
  })();

  const overviewBullets = useMemo(() => {
    const fromTags = unit.customTags
      .map((t) => {
        const i = t.indexOf(':');
        if (i <= 0) return null;
        const key = t.slice(0, i).trim().toLowerCase();
        if (key === 'promotions') return null;
        const val = t.slice(i + 1).trim();
        if (!val) return null;
        return val.replace(/[-_]/g, ' ');
      })
      .filter((x): x is string => Boolean(x))
      .slice(0, 8);
    if (fromTags.length >= 4) return fromTags;
    return [
      'Live video walkthrough with a product specialist',
      'Real inventory — updated in real time',
      'Transparent pricing and financing options',
      'Nationwide delivery available',
    ];
  }, [unit.customTags]);

  const specs: { icon: typeof Gauge; label: string; value: string }[] = [
    { icon: Bus, label: 'RV Type', value: rvTypeLabel ?? '—' },
    { icon: Car, label: 'Chassis', value: chassisLabel ?? '—' },
    { icon: Ruler, label: 'Length', value: unit.wI_Length ? `${unit.wI_Length} ft` : '—' },
    { icon: Gauge, label: 'Sleeps', value: formatSleeps(unit.sleepsCount) ?? '—' },
    { icon: Gauge, label: 'Mileage', value: formatMileage(unit.wI_Mileage) ?? '—' },
    { icon: Cog, label: 'Engine', value: unit.wI_Engine?.trim() ? unit.wI_Engine : '—' },
    { icon: Fuel, label: 'Fuel Type', value: unit.wI_Fuel || '—' },
    { icon: Truck, label: 'Drivetrain', value: driveTrainLabel ?? '—' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 md:pb-20">
      <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/inventory"
          className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-neutral-900 transition hover:underline"
        >
          <ChevronLeft className="size-4" />
          Back to Inventory
        </Link>
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-wrap text-neutral-600">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/inventory">Inventory</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[min(100%,12rem)] truncate sm:max-w-[20rem] md:max-w-none">
                {unit.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 shadow-sm">
            <div className="h-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full touch-pan-y">
                {slides.map((src: string, i: number) => (
                  <div key={`${unit.id}-detail-${i}`} className="relative min-w-0 shrink-0 grow-0 basis-full">
                    <img src={src} alt="" className="h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
                  </div>
                ))}
              </div>
            </div>

            {isAvailable && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-bold tracking-wide text-white shadow-md">
                <span className="size-2 rounded-full bg-white" aria-hidden />
                AVAILABLE TO SEE LIVE
              </div>
            )}

            {canScrollPrev && (
              <button
                type="button"
                aria-label="Previous photo"
                className="absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md transition hover:bg-white"
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="size-6" strokeWidth={2} />
              </button>
            )}
            {canScrollNext && (
              <button
                type="button"
                aria-label="Next photo"
                className="absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-800 shadow-md transition hover:bg-white"
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="size-6" strokeWidth={2} />
              </button>
            )}
          </div>

          {slides.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5">
              {slides.map((src, i) => (
                <button
                  key={`${unit.id}-thumb-${i}`}
                  ref={(node) => {
                    thumbRefs.current[i] = node;
                  }}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === slideIndex
                      ? 'border-primary ring-primary/30 ring-1'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            {unit.wI_InventoryType === 'New' ? (
              <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">New</span>
            ) : (
              <span className="rounded-md bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800">Used</span>
            )}
            {(unit.isSpecialOffer || unit.inFlashSale) && (
              <span className="rounded bg-[#1e4d8b] px-2.5 py-1 text-xs font-bold tracking-wide text-white uppercase">
                Best value
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl lg:text-[1.85rem] xl:text-4xl">
              {unit.title}
            </h1>
            {quickHeroSpecs && <p className="mt-2 text-sm text-neutral-600 md:text-base">{quickHeroSpecs}</p>}
          </div>

          {isTooLowToShow ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center">
              <p className="text-sm font-semibold text-neutral-800">Call for price</p>
              <p className="text-muted-foreground mt-1 text-sm">Our price is too low to advertise online.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-end gap-3">
                <p className="text-4xl font-bold tracking-tight text-neutral-900 tabular-nums sm:text-[2.75rem]">
                  {displayPrice > 0 ? formatPrice(displayPrice) : '—'}
                </p>
                {msrp > 0 && msrp > displayPrice ? (
                  <p className="text-lg text-neutral-500 tabular-nums line-through">{formatPrice(msrp)}</p>
                ) : null}
              </div>
              {savingAmount > 0 && !isTooLowToShow ? (
                <p className="text-base font-semibold text-emerald-600">Save {formatPrice(savingAmount)}</p>
              ) : null}
              {rebateFootnote ? <p className="text-muted-foreground text-xs">{rebateFootnote}</p> : null}
            </div>
          )}

          {!isTooLowToShow && displayPrice > 0 ? (
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="flex w-full cursor-pointer items-stretch overflow-hidden rounded-lg border border-neutral-300 bg-neutral-50 text-left transition hover:bg-neutral-100/80"
            >
              <div className="flex flex-1 flex-col justify-center border-r border-neutral-300 px-4 py-3 sm:py-4">
                <p className="text-lg font-bold text-neutral-900 tabular-nums sm:text-xl">
                  {formatPrice(estimatedMonthly)}
                  <span className="text-sm font-semibold text-neutral-600">/mo*</span>
                </p>
                <p className="text-xs font-medium text-neutral-500">Est. payment</p>
              </div>
              <div className="flex flex-1 items-center justify-between gap-2 px-4 py-3 sm:py-4">
                <div>
                  <p className="text-sm font-bold text-neutral-900">Get Pre-Approved</p>
                  <p className="text-xs text-neutral-600">No impact to credit score</p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-neutral-500" aria-hidden />
              </div>
            </button>
          ) : null}

          {isAvailable ? (
            <button
              type="button"
              onClick={open}
              className="flex w-full cursor-pointer items-center justify-center gap-4 rounded-lg bg-neutral-950 px-4 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-neutral-900"
            >
              <Video className="size-8 shrink-0" strokeWidth={2} aria-hidden />
              <div className="text-left">
                <p className="text-base font-bold text-white">See This Van Live</p>
                <p className="text-xs text-white">Talk to a specialist now</p>
              </div>
            </button>
          ) : null}

          {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAiChatDialogOpen(true)}
              className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
            >
              <MessageCircle className="size-5 shrink-0" strokeWidth={2} aria-hidden />
              <div className="text-left">
                <p className="text-sm font-bold text-neutral-900">Chat Now</p>
                <p className="text-xs text-neutral-600">Live support</p>
              </div>
            </button>
          </div> */}

          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
          >
            <Smartphone className="size-5 shrink-0" strokeWidth={2} aria-hidden />
            <div className="text-left">
              <p className="text-sm font-bold text-neutral-900">Text Us</p>
              <p className="text-xs text-neutral-600">Fast response</p>
            </div>
          </button>
        </div>
      </div>

      {isAvailable ? (
        <section className="mt-6 rounded-xl bg-white px-4 py-8 sm:mt-8 sm:px-8 sm:py-10 lg:mt-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <div className="flex flex-row items-center gap-4">
                <div className="flex shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 p-2 sm:p-3">
                  <Video className="size-10 text-neutral-900" strokeWidth={1.5} aria-hidden />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl">
                    Walk around this van. Live.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700 md:text-base">
                    Our specialists can show you anything, inside and out.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={open}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-900"
              >
                <Video className="size-5 shrink-0" strokeWidth={2} aria-hidden />
                See This Van Live
              </button>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              {users.length > 0 ? (
                <div className="flex items-center -space-x-2">
                  {users.slice(0, 3).map((user: ViewProWidgetUser) => (
                    <div key={user.username} className="relative shrink-0">
                      <Image
                        src={'/viewpro/public/avatars/' + user.avatar}
                        alt=""
                        width={56}
                        height={56}
                        className="size-14 rounded-full border-4 border-white object-cover shadow-md"
                      />
                      <span
                        className="absolute right-0 bottom-0 size-3.5 rounded-full border-2 border-white bg-emerald-500"
                        aria-hidden
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full border border-dashed border-neutral-300 bg-white text-xs font-medium text-neutral-500">
                  Team
                </div>
              )}
              <p className="text-sm font-medium text-neutral-800">Specialists online until 7:00 PM PT</p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-6 sm:mt-8 lg:mt-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex h-auto w-full flex-nowrap justify-start gap-x-1 gap-y-0 overflow-x-auto overflow-y-hidden rounded-none border-b border-neutral-300/80 bg-transparent p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(
              [
                ['overview', 'Overview'],
                ['features', 'Features'],
                ['floorplan', 'Floorplan'],
                ['specs', 'Specs'],
                ['compare', 'Compare'],
              ] as const
            ).map(([id, label]) => (
              <TabsTrigger
                key={id}
                value={id}
                className={cn(
                  'rounded-none border-0 border-b-[3px] border-transparent bg-transparent px-2.5 py-3 text-[11px] font-semibold tracking-wide text-neutral-500 uppercase shadow-none sm:px-4 sm:text-xs',
                  'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-neutral-900 data-[state=active]:shadow-none',
                )}
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
              <div className="min-w-0 space-y-4">
                <h2 className="text-xl font-bold text-neutral-900 md:text-2xl">
                  Adventure-ready. Off-grid capable. Built to roam.
                </h2>
                <p className="text-[15px] leading-relaxed text-neutral-700">{loveParagraph}</p>
                <ul className="space-y-2.5">
                  {overviewBullets.map((line, i) => (
                    <li key={`${i}-${line.slice(0, 24)}`} className="flex gap-2 text-sm text-neutral-800">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" strokeWidth={2} aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setActiveTab('features')}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-900 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
                >
                  View Full Features
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </button>
              </div>
              <div className="min-w-0">
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  <div className="relative aspect-4/3 w-full p-3">
                    <img src={floorplanSrc} alt="Floorplan" className="h-full w-full object-contain" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFloorplanDialogOpen(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white py-2.5 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
                >
                  View 360° Tour
                  <span className="text-xs font-normal text-neutral-500">(Floorplan)</span>
                </button>
              </div>
            </div>

            <TabPanelCard
              title="Why shoppers choose us"
              contentClassName="space-y-4"
              footer={
                <div className="bg-[#F8F9FA] p-4 sm:px-6 sm:py-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-6 xl:gap-10">
                    <div className="flex gap-4 lg:min-w-0 lg:flex-1">
                      <ShoppingBag className="size-10 shrink-0 text-neutral-700" strokeWidth={1.5} aria-hidden />
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900">Real Inventory</p>
                        <p className="mt-1 text-sm leading-snug text-neutral-600">Updated in real time</p>
                      </div>
                    </div>
                    <div className="flex gap-4 lg:min-w-0 lg:flex-1">
                      <ShieldCheck className="size-10 shrink-0 text-neutral-700" strokeWidth={1.5} aria-hidden />
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900">Best Price Guarantee</p>
                        <p className="mt-1 text-sm leading-snug text-neutral-600">
                          We&apos;ll always give you our best price.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 lg:min-w-0 lg:flex-1">
                      <User className="size-10 shrink-0 text-neutral-700" strokeWidth={1.5} aria-hidden />
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900">No Hidden Fees</p>
                        <p className="mt-1 text-sm leading-snug text-neutral-600">No pressure. Just real savings.</p>
                      </div>
                    </div>
                  </div>
                </div>
              }
            >
              <p>
                Every listing is backed by specialists who know these vans inside and out — from electrical systems to
                delivery logistics.
              </p>
            </TabPanelCard>
          </TabsContent>

          <TabsContent value="specs" className="mt-0 space-y-6">
            <TabPanelCard title="Specifications">
              <div className="grid gap-3 sm:grid-cols-2">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200/90 bg-[#F8F9FA] px-4 py-3.5"
                  >
                    <Icon className="size-8 shrink-0 text-neutral-600" strokeWidth={1.75} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-500">{label}</p>
                      <p className="font-semibold text-neutral-900">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabPanelCard>
          </TabsContent>

          <TabsContent value="features" className="mt-0">
            <TabPanelCard title="Features & options">
              <p>
                Full feature packages vary by chassis and factory options. Connect live with a specialist to walk
                through interior storage, electrical systems, climate, and optional equipment on this unit.
              </p>
              <ul className="mt-5 list-disc space-y-2.5 pl-5 text-sm">
                <li>Walk the interior with a live video tour</li>
                <li>Confirm options and packages on this stock number</li>
                <li>Ask about delivery, orientation, and service</li>
              </ul>
            </TabPanelCard>
          </TabsContent>

          <TabsContent value="floorplan" className="mt-0">
            <TabPanelCard title="Floorplan">
              <div className="overflow-hidden rounded-lg bg-[#F8F9FA]">
                <img
                  src={floorplanSrc}
                  alt="RV floorplan diagram"
                  className="mx-auto max-h-[420px] w-full object-contain p-6"
                />
              </div>
              <p className="mt-4 text-sm text-neutral-600">
                Detailed diagrams may be available from the manufacturer for this model.
              </p>
            </TabPanelCard>
          </TabsContent>

          <TabsContent value="compare" className="mt-0">
            <TabPanelCard title="Compare inventory">
              <p>
                Open other listings in a new tab and use stock numbers to compare with your specialist during a live
                session.
              </p>
              <Link
                href="/inventory"
                className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
              >
                Browse more inventory
                <ArrowRight className="size-4 shrink-0" />
              </Link>
            </TabPanelCard>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={floorplanDialogOpen} onOpenChange={setFloorplanDialogOpen}>
        <DialogContent
          showCloseButton
          className="data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 fixed inset-0 top-0 left-0 z-50 flex h-screen max-h-screen w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-black p-0 shadow-none duration-200 sm:max-w-none [&>button]:top-3 [&>button]:right-4 [&>button]:z-30 [&>button]:text-white [&>button]:opacity-70 hover:[&>button]:opacity-100"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Floorplan</DialogTitle>
            <DialogDescription>Full screen floorplan image for {unit.title}</DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-6">
            <img
              src={floorplanSrc}
              alt={`Floorplan for ${unit.title}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} unit={unit} />
      {/* <AiChatDialog open={aiChatDialogOpen} onOpenChange={setAiChatDialogOpen} /> */}
    </div>
  );
}
