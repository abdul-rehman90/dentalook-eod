'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Dropdown, Tabs } from 'antd';
import { Icons } from '@/common/assets';
import { usePathname, useRouter } from 'next/navigation';
import { removeUserAndToken } from '@/common/utils/auth-user';
import { useGlobalContext } from '@/common/context/global-context';
import { getCanadianTimeFormatted } from '@/common/utils/time-handling';

const items = [
  { key: '/submission/eod', label: 'Submit End Of Day' },
  { key: '/submission/eom', label: 'Submit End of Month' },
  { key: '/review/list/eod', label: 'Review EOD Submissions' },
  { key: '/review/list/eom', label: 'Review EOM Submissions' },
  { key: '/calendar', label: 'Submission Tracker' },
  { key: '/dashboard', label: 'Dashboard' }
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDirty } = useGlobalContext();
  const [currentTime] = useState(getCanadianTimeFormatted());
  const isMainRoute = pathname === '/clinics-reporting' || pathname === '/';

  const guardedPush = (url) => {
    if (isDirty && url !== pathname) {
      window.dispatchEvent(
        new CustomEvent('guard:navigate', { detail: { url } })
      );
    } else {
      router.push(url);
    }
  };

  function handleSignOut() {
    removeUserAndToken();
    localStorage.removeItem('role');
    guardedPush('/login');
  }

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

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[#F7F7F7] px-8 py-5">
      <div className="flex gap-2 justify-between">
        <div className="flex gap-8">
          <div
            onClick={() => guardedPush('/clinics-reporting')}
            className="cursor-pointer inline-block"
          >
            <Image src={Icons.logo2} alt="logo" />
          </div>

          {!isMainRoute && (
            <Tabs
              type="line"
              activeKey={activeKey}
              className="[&_.ant-tabs-nav]:!mb-0"
              items={items.map((item) => {
                const href = item.key.startsWith('/submission')
                  ? `${item.key}/1`
                  : item.key;

                return {
                  key: item.key,
                  label: (
                    <Link
                      href={href}
                      prefetch={false}
                      onClick={(e) => {
                        e.preventDefault(); // stop Link’s default push
                        guardedPush(href); // use guarded navigation
                      }}
                    >
                      {item.label}
                    </Link>
                  )
                };
              })}
            />
          )}
        </div>

        <div className="flex items-center h-fit gap-4 2xl:gap-8">
          <p className="text-xs text-black font-medium text-nowrap">
            {currentTime}
          </p>
          <Dropdown
            menu={{
              items: [{ key: 'sign-out', label: 'Sign Out' }],
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
