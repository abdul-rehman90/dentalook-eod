'use client';

import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Icons } from '@/common/assets';
import { useRouter } from 'next/navigation';
import { Input, Card, Row, Col, Form } from 'antd';
import { AuthService } from '@/common/services/auth';
import { Button } from '@/common/components/button/button';
import { setUserAndToken } from '@/common/utils/auth-user';

export default function LoginForm() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await AuthService.login(values);
      if (response.status === 200) {
        setUserAndToken(response.data.access);
        router.push('/clinics-reporting');
        toast.success('Login successful!');
      }
    } catch (error) {
      let errorMessage =
        error?.response?.data?.detail ??
        'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white">
      <Row className="h-full">
        {/* Left side with image */}
        <Col xs={0} sm={0} md={12}>
          <div className="dentalook-bg"></div>
        </Col>

        {/* Right side with login form */}
        <Col
          xs={24}
          sm={24}
          md={12}
          className="!flex items-center justify-center p-8"
        >
          <Card className="w-full max-w-md !rounded-xl">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div>
                <Image src={Icons.logo} alt="logo" />
              </div>
              <h4 className="text-xl text-[#404856]">Login to DentaLook</h4>
            </div>
            <Form
              form={form}
              name="login"
              layout="vertical"
              autoComplete="off"
              onFinish={onFinish}
              initialValues={{ remember: true }}
            >
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Name is required' }]}
              >
                <Input
                  placeholder="Enter name"
                  className="!p-2 !rounded-md !bg-[#F9FAFB] !text-[#6B7280]"
                />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Password is required' }]}
              >
                <Input.Password
                  placeholder="Enter password"
                  className="!p-2 !rounded-md !bg-[#F9FAFB] !text-[#6B7280]"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  size="lg"
                  type="submit"
                  variant="secondary"
                  isLoading={loading}
                  className="w-full h-9 !shadow-none text-black !rounded-lg"
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
