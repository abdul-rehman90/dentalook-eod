'use client';

import React from 'react';
import Image from 'next/image';
import { Dropdown, Space } from 'antd';
import { Icons } from '@/common/assets';
import { DownOutlined } from '@ant-design/icons';
import { Button } from '@/common/components/button/button';

function DropdownCom({ menu }) {
  return (
    <Space wrap>
      <Dropdown menu={menu}>
        <Button size="sm" variant="outline" className="!px-5 h-8.5 text-black">
          <Image src={Icons.share} alt="share" />
          Share
          <DownOutlined style={{ width: 14, height: 14 }} />
        </Button>
      </Dropdown>
    </Space>
  );
}

export { DropdownCom };
