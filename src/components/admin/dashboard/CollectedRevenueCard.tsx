'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DollarSign, ChevronDown, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export interface MonthlyRevenueItem {
  monthKey: string; // "YYYY-MM" e.g. "2026-09"
  label: string; // "September 2026"
  shortLabel: string; // "Sep 2026"
  amountPaid: number;
  transactionCount: number;
}

interface CollectedRevenueCardProps {
  monthlyItems: MonthlyRevenueItem[];
  allTimeRevenue: number;
  allTimeTransactions: number;
}

export function CollectedRevenueCard({
  monthlyItems,
  allTimeRevenue,
  allTimeTransactions,
}: CollectedRevenueCardProps) {
  // Default to current/first month in the list
  const [selectedKey, setSelectedKey] = useState<string>(
    monthlyItems[0]?.monthKey || 'ALL'
  );

  const isAllTime = selectedKey === 'ALL';
  const currentItem = isAllTime
    ? {
        monthKey: 'ALL',
        label: 'All Time Total',
        shortLabel: 'All Time',
        amountPaid: allTimeRevenue,
        transactionCount: allTimeTransactions,
      }
    : monthlyItems.find((m) => m.monthKey === selectedKey) || monthlyItems[0];

  const amount = currentItem ? currentItem.amountPaid : 0;
  const count = currentItem ? currentItem.transactionCount : 0;

  // Exact formatted string (e.g. "1,350,000")
  const formattedFull = amount.toLocaleString('en-US');

  return (
    <div className="bg-white dark:bg-[#131313] border border-neutral-200 dark:border-white/10 rounded-2xl p-5 hover:border-neutral-300 dark:hover:border-white/20 transition-all group flex flex-col justify-between">
      {/* Top Header: Icon & Month Selector */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#1C1B1B] border border-neutral-200/50 dark:border-white/5 flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:text-[#EBFF00] group-hover:border-[#EBFF00]/30 transition-colors shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>

        {/* Month Selector Dropdown with actual DB values */}
        <div className="relative">
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="appearance-none bg-neutral-100 dark:bg-[#1C1B1B] hover:bg-neutral-200 dark:hover:bg-white/10 border border-neutral-200/80 dark:border-white/10 rounded-xl pl-2.5 pr-7 py-1 text-[11px] font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer focus:outline-none focus:border-[#EBFF00] transition-colors"
            title="Select month to view collected revenue"
          >
            {monthlyItems.map((item, idx) => (
              <option
                key={item.monthKey}
                value={item.monthKey}
                className="bg-white dark:bg-[#131313] text-neutral-900 dark:text-white"
              >
                {item.shortLabel} {idx === 0 ? '(Current)' : ''} — {item.amountPaid.toLocaleString()} UZS
              </option>
            ))}
            <option
              value="ALL"
              className="bg-white dark:bg-[#131313] text-neutral-900 dark:text-white font-bold"
            >
              All Time Total — {allTimeRevenue.toLocaleString()} UZS
            </option>
          </select>
          <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Main Stats Display: Exact Live DB Amount */}
      <div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {formattedFull}
          </span>
          <span className="text-xs font-bold text-neutral-400">UZS</span>
        </div>

        <div className="flex items-center justify-between mt-1 text-xs">
          <span className="text-neutral-500 dark:text-neutral-400 font-medium truncate">
            {isAllTime ? 'Total All-Time Revenue' : `Collected in ${currentItem?.shortLabel}`}
          </span>
          <Link
            href={isAllTime ? '/admin/payments' : `/admin/payments?month=${selectedKey}`}
            className="inline-flex items-center gap-0.5 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-[#EBFF00] transition-colors shrink-0"
            title="View in Billing"
          >
            <span>{count} paid</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
