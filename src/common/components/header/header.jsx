'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dropdown, Tabs } from 'antd';
import { Icons } from '@/common/assets';
import { usePathname, useRouter } from 'next/navigation';
import { removeUserAndToken } from '@/common/utils/auth-user';
import { getCanadianTimeFormatted } from '@/common/utils/time-handling';

const items = [
  { key: '/submission/eod', label: 'Submit End Of Day' },
  { key: '/submission/eom', label: 'Submit End of Month' },
  { key: '/review/list/eod', label: 'Review EOD Submissions' },
  { key: '/review/list/eom', label: 'Review EOM Submissions' },
  { key: '/calendar', label: 'Submissioin Tracker' },
  { key: '/dashboard', label: 'Dashboard' }
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(getCanadianTimeFormatted());
  const isMainRoute = pathname === '/clinics-reporting' || pathname === '/';

  const getActiveKey = () => {
    if (pathname.startsWith('/submission/eod')) return '/submission/eod';
    if (pathname.startsWith('/submission/eom')) return '/submission/eom';
    if (
      pathname.startsWith('/review/list/eod') ||
      pathname.startsWith('/review/eod/')
    )
      return '/review/list/eod';
    if (
      pathname.startsWith('/review/list/eom') ||
      pathname.startsWith('/review/eom/')
    )
      return '/review/list/eom';
    if (pathname.startsWith('/calendar')) return '/calendar';
    if (pathname.startsWith('/dashboard')) return '/dashboard';
    return '';
  };

  const activeKey = getActiveKey();

  function handleSignOut() {
    removeUserAndToken();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[#F7F7F7] px-13 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/clinics-reporting"
            className="cursor-pointer inline-block"
          >
            <Image src={Icons.logo2} alt="logo" />
          </Link>
          {!isMainRoute && (
            <Tabs
              activeKey={activeKey}
              type="line"
              className="[&_.ant-tabs-nav]:!mb-0"
              items={items.map((item) => ({
                key: item.key,
                label: (
                  <Link
                    href={
                      item.key.startsWith('/submission')
                        ? `${item.key}/1`
                        : item.key
                    }
                  >
                    {item.label}
                  </Link>
                )
              }))}
            />
          )}
        </div>

        <div className="flex items-center gap-8">
          <p className="text-xs text-black font-medium">{currentTime}</p>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'sign-out',
                  label: 'Sign Out'
                }
              ],
              onClick: (e) => {
                if (e.key === 'sign-out') handleSignOut();
              }
            }}
            trigger={['click']}
          >
            <span className="p-1 cursor-pointer border border-secondary-50 shadow-sm rounded-full text-secondary-500 hover:bg-secondary-50 transition-colors">
              DD
            </span>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
