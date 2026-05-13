'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUp, Camera, Heart, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useViewProWidget } from '@/components/view-pro-widget-provider';
import { api } from '@/lib/api';
import { cn, formatMileage, formatPrice, formatSleeps, getInventoryPricing, labelFromValue } from '@/lib/utils';
import { mapInventoryItem, type ChatGPTResponse, type InventoryUnit } from '@/lib/types';

const GREETING =
  "Hi! I'm RecVan AI 👋 I can help you find the perfect van, compare models, check availability, and answer any questions you have. **What can I help you with today?**";

type AiChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  inventories?: InventoryUnit[];
};

function unitImageSrc(unit: InventoryUnit): string {
  if (unit.images?.length) return unit.images[0]!;
  if (unit.defaultImageUrl) return unit.defaultImageUrl;
  return '/images/photos_coming_soon.jpg';
}

function inventoryResultText(total: number): string {
  if (total <= 0) return "I couldn't find matching vans right now. Try broadening your search.";
  if (total === 1) return 'I found 1 matching van for you.';
  return `I found ${total} matching vans for you.`;
}

function AiCard({ unit }: { unit: InventoryUnit }) {
  const router = useRouter();
  const { msrp, displayPrice, netPrice, savingAmount, isTooLowToShow, showDetailedBreakdown } =
    getInventoryPricing(unit);
  const currentPrice = !isTooLowToShow && displayPrice > 0 ? (showDetailedBreakdown ? netPrice : displayPrice) : null;

  const specParts = [
    unit.wI_Fuel,
    formatMileage(unit.wI_Mileage) ?? null,
    formatSleeps(unit.sleepsCount) ?? null,
  ].filter(Boolean) as string[];
  const specLine = specParts.join(' • ');

  const tags = unit.customTags
    .map((tag) => {
      const [key, value] = tag.split(':');
      return { key, value: value.trim() };
    })
    .filter((tag) => tag.key && tag.value && tag.key !== 'promotions')
    .map((tag) => labelFromValue(tag.value))
    .slice(0, 2);

  const imageSrc = unitImageSrc(unit);

  return (
    <div
      onClick={() => router.push(`/inventory/${unit.id}`)}
      className="flex h-full min-h-0 max-w-[240px] min-w-[220px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm select-none"
    >
      <div className="group relative h-[132px] w-full shrink-0 overflow-hidden bg-neutral-100 sm:h-[148px]">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
          sizes="240px"
          unoptimized={imageSrc.startsWith('http')}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-left text-xs leading-snug font-bold text-neutral-900">{unit.title}</h3>
        {specLine ? <p className="text-[11px] leading-snug text-neutral-500">{specLine}</p> : null}
        <div className="mt-0.5">
          {isTooLowToShow || !currentPrice ? (
            <p className="text-sm font-bold text-neutral-900">Call for price</p>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
              <span className="text-base font-bold text-neutral-900 tabular-nums">{formatPrice(currentPrice)}</span>
              {msrp > currentPrice + 0.5 ? (
                <span className="text-[11px] font-medium text-neutral-400 tabular-nums line-through">
                  {formatPrice(msrp)}
                </span>
              ) : null}
            </div>
          )}
          {!isTooLowToShow && savingAmount > 0 ? (
            <p className="mt-0.5 text-[11px] font-semibold text-emerald-700 tabular-nums">
              Save {formatPrice(savingAmount)}
            </p>
          ) : null}
        </div>
        {tags.length > 0 ? (
          <div className="mt-auto flex flex-wrap gap-1 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-600"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <Button
          asChild
          className="mt-2 h-9 w-full gap-1.5 rounded-lg bg-neutral-900 text-[11px] font-extrabold tracking-wide text-white uppercase hover:bg-neutral-800"
        >
          <Link href={`/inventory/${unit.id}`}>
            <Camera className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
            View Details
          </Link>
        </Button>
      </div>
    </div>
  );
}

function renderAssistantText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold wrap-anywhere text-neutral-900">
        {part}
      </strong>
    ) : (
      <span key={i} className="wrap-anywhere">
        {part}
      </span>
    ),
  );
}

export function AiChatDialog({ open, onOpenChange }: AiChatDialogProps) {
  const { isAvailable } = useViewProWidget();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setMessages([{ id: crypto.randomUUID(), role: 'assistant', text: GREETING }]);
    setInput('');
    setIsTyping(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [open, messages, isTyping]);

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || isTyping) return;

      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text }]);
      setInput('');
      setIsTyping(true);

      try {
        const res = (await api.post('chatgpt/chat', { message: text, body: 'class-b' })) as ChatGPTResponse;
        const inventories = res.data.inventories?.map(mapInventoryItem) ?? [];
        const resultTotal = res.data.pagination?.total ?? 0;
        const reply = res.data.reply?.trim() || inventoryResultText(resultTotal);

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: reply,
            inventories: inventories.length > 0 ? inventories : undefined,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: "Sorry, I couldn't fetch a response right now. Please try again.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(90vh,calc(100%-2rem))] max-h-[min(90vh,calc(100%-2rem))] max-w-xl min-w-0 flex-col gap-0 overflow-hidden border-neutral-200 p-0 shadow-2xl sm:max-w-xl"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-neutral-200 px-4 py-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
            <Sparkles className="size-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-left text-base font-bold text-neutral-900">Ask RecVan AI</DialogTitle>
            <DialogDescription className="text-left text-xs">Your van expert. Here to help.</DialogDescription>
            {isAvailable ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-neutral-600">
                <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                Specialists Online Now
              </p>
            ) : (
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-neutral-600">
                <span className="size-1.5 shrink-0 rounded-full bg-neutral-300" aria-hidden />
                Specialists Offline
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>

        <div ref={scrollRef} className="min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto bg-white px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn('flex w-full min-w-0', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {message.role === 'assistant' ? (
                <div className="min-w-0 space-y-3">
                  <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-neutral-100 px-3.5 py-2.5 text-sm leading-relaxed wrap-anywhere text-neutral-800">
                    {renderAssistantText(message.text)}
                  </div>
                  {message.inventories && message.inventories.length > 0 ? (
                    <div className="-mx-1">
                      <Carousel opts={{ align: 'start', loop: false }} className="w-full">
                        <CarouselContent className="-ml-2">
                          {message.inventories.map((unit) => (
                            <CarouselItem key={unit.id} className="basis-auto pl-2">
                              <AiCard unit={unit} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="-left-1 size-8 border-neutral-200 bg-white shadow-md" />
                        <CarouselNext className="-right-1 size-8 border-neutral-200 bg-white shadow-md" />
                      </Carousel>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="max-w-[min(80%,100%)] min-w-0 rounded-2xl rounded-tr-md bg-neutral-900 px-3.5 py-2.5 text-sm leading-relaxed wrap-anywhere text-white">
                  {message.text}
                </div>
              )}
            </div>
          ))}
          {isTyping ? (
            <div className="flex justify-start">
              <div
                className="rounded-2xl rounded-tl-md bg-neutral-100 px-5 py-3 shadow-sm"
                role="status"
                aria-label="RecVan AI is typing"
              >
                <span className="inline-flex items-center gap-1.5" aria-hidden>
                  <span className="size-2 animate-bounce rounded-full bg-neutral-400/90 [animation-delay:-0.3s]" />
                  <span className="size-2 animate-bounce rounded-full bg-neutral-400/90 [animation-delay:-0.15s]" />
                  <span className="size-2 animate-bounce rounded-full bg-neutral-400/90" />
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 space-y-3 border-t border-neutral-100 bg-white px-4 pt-3 pb-4">
          <div className="relative flex min-w-0 items-end gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/80 py-2 pr-2 pl-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage(input);
                }
              }}
              placeholder="Ask anything about vans..."
              rows={2}
              className="max-h-28 min-h-10 w-full min-w-0 flex-1 resize-none border-0 bg-transparent py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-0 focus-visible:outline-none"
              aria-label="Message RecVan AI"
            />
            <button
              type="button"
              aria-label="Send"
              disabled={isTyping || !input.trim()}
              onClick={() => void sendMessage(input)}
              className="mb-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp className="size-5" strokeWidth={2} aria-hidden />
            </button>
          </div>
          <p className="text-center text-[10px] text-neutral-500">
            AI responses may not always be accurate. Please verify important information.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
