'use client';

import React from 'react';
import Image from 'next/image';
import { Dropdown, Tabs } from 'antd';
import { Icons } from '@/common/assets';
import { DownOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/common/components/button/button';
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/common/components/avatar/avatar';

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
  const isMainRoute = pathname === '/clinics-reporting' || pathname === '/';

  const menuProps = {
    items: [
      {
        label: 'Copy link',
        key: '1'
      },
      {
        label: 'Add to Teams',
        key: '2'
      }
    ],
    onClick: handleMenuClick
  };

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

  function handleMenuClick(e) {
    console.log('click', e);
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-secondary-50 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className="cursor-pointer"
            onClick={() => router.push('/clinics-reporting')}
          >
            <Image src={Icons.logo} alt="logo" />
          </div>
          {!isMainRoute && (
            <Tabs
              items={items}
              onChange={onChange}
              activeKey={activeKey}
              className="[&_.ant-tabs-nav]:!mb-0"
              tabBarStyle={{
                fontWeight: 500,
                color: '#030303'
              }}
            />
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Dropdown menu={menuProps}>
            <Button
              size="sm"
              variant="outline"
              className="!px-5 h-8.5 text-black"
            >
              <Image src={Icons.share} alt="share" />
              Share
              <DownOutlined style={{ width: 14, height: 14 }} />
            </Button>
          </Dropdown>
          <Button size="sm" variant="ghost" className="!px-1.5 h-8.5">
            <Image src={Icons.fullScreen} alt="fullscreen" />
          </Button>
          <Button size="sm" variant="ghost" className="!px-1.5 h-8.5">
            <Image src={Icons.download} alt="download" />
          </Button>
          <Button size="sm" variant="ghost" className="!px-1.5 h-8.5">
            <Image src={Icons.setting} alt="setting" />
          </Button>
          <Button size="sm" variant="ghost" className="!px-1.5 h-8.5">
            <Image src={Icons.help} alt="help" />
          </Button>
          <Avatar className="w-8.5 h-8.5">
            <AvatarImage src={Icons.userAvatar.src} />
            <AvatarFallback></AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
