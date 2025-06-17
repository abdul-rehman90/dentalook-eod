import React from 'react';
import { Modal, Form } from 'antd';
import { Button } from '@/common/components/button/button';
import { useGlobalContext } from '@/common/context/global-context';

export default function AddModal({
  visible,
  onCancel,
  children,
  onSubmit,
  initialValues
}) {
  const [form] = Form.useForm();
  const { steps, currentStep } = useGlobalContext();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
      onCancel();
    } catch (error) {}
  };

  return (
    <Modal
      centered
      open={visible}
      onCancel={onCancel}
      title={
        <div className="p-4">
          <h4
            style={{
              marginBottom: 0,
              fontWeight: 500,
              color: '#030303'
            }}
          >
            Add New Provider
          </h4>
          <p
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: '#484A54'
            }}
          >
            Step {currentStep} of 8 - {steps[currentStep - 1].name}
          </p>
        </div>
      }
      footer={
        <div className="p-4 flex items-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={onCancel}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Cancel
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleSubmit}
            className="h-9 !shadow-none text-black !rounded-lg"
          >
            Create
          </Button>
        </div>
      }
    >
      <Form form={form} initialValues={initialValues}>
        {children}
      </Form>
    </Modal>
  );
}
