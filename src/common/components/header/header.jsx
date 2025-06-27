'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dropdown, Tabs } from 'antd';
import { Icons } from '@/common/assets';
import { usePathname, useRouter } from 'next/navigation';
import { removeUserAndToken } from '@/common/utils/auth-user';
import { getCanadianTimeFormatted } from '@/common/utils/time-handling';

const items = [
  {
    key: '/submission/eod',
    label: 'Submit End Of Day'
  },
  {
    key: '/submission/eom',
    label: 'Submit End of Month'
  },
  {
    key: '/review/list/eod',
    label: 'Review EOD Submissions'
  },
  {
    key: '/review/list/eom',
    label: 'Review EOM Submissions'
  }
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(getCanadianTimeFormatted());
  const isMainRoute = pathname === '/clinics-reporting' || pathname === '/';

  const getActiveKey = () => {
    if (pathname.startsWith('/submission/eod')) {
      return '/submission/eod';
    }
    if (pathname.startsWith('/submission/eom')) {
      return '/submission/eom';
    }
    if (
      pathname.startsWith('/review/list/eod') ||
      pathname.startsWith('/review/eod/')
    ) {
      return '/review/list/eod';
    }
    if (
      pathname.startsWith('/review/list/eom') ||
      pathname.startsWith('/review/eom/')
    ) {
      return '/review/list/eom';
    }
    return '';
  };

  const activeKey = getActiveKey();

  const onChange = (key) => {
    if (key.startsWith('/submission')) {
      router.push(`${key}/1`);
    } else if (key.startsWith('/review')) {
      router.push(`${key}`);
    }
  };

  function handleSignOut() {
    removeUserAndToken();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[#F7F7F7] px-13 py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div
            className="cursor-pointer"
            onClick={() => router.push('/clinics-reporting')}
          >
            <Image src={Icons.logo2} alt="logo" />
          </div>
          {!isMainRoute && (
            <Tabs
              items={items}
              onChange={onChange}
              activeKey={activeKey}
              className="[&_.ant-tabs-nav]:!mb-0"
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
                if (e.key === 'sign-out') {
                  handleSignOut();
                }
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
